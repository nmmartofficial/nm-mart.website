-- Website checkout atomic RPC package
-- IMPORTANT: this is a schema-aware migration package prepared for a verified Supabase
-- environment. It is not executed in the current repo because no safe DB SQL access exists.
--
-- This package intentionally avoids inventing missing tables/columns. It only creates the
-- Website RPC when the required shared tables exist and the migration is being applied to a
-- live database whose schema has been inspected and confirmed.

BEGIN;

DO $$
BEGIN
  -- Guard the migration against unknown live schemas. These are the minimum shared objects
  -- that must already exist in the target Supabase project.
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'products'
  ) THEN
    RAISE EXCEPTION 'Required table public.products is missing. Inspect the live schema before applying this migration.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'orders'
  ) THEN
    RAISE EXCEPTION 'Required table public.orders is missing. Inspect the live schema before applying this migration.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) THEN
    RAISE EXCEPTION 'Required table public.profiles is missing. Inspect the live schema before applying this migration.';
  END IF;

  -- The migration package expects the target database to have a compatible order item table and
  -- inventory log table. If those do not exist, the DB operator must verify the actual shared schema
  -- before proceeding instead of guessing.
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'order_items'
  ) THEN
    RAISE EXCEPTION 'Required table public.order_items is missing. Inspect the live schema before applying this migration.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'inventory_logs'
  ) THEN
    RAISE EXCEPTION 'Required table public.inventory_logs is missing. Inspect the live schema before applying this migration.';
  END IF;

  -- Existing live schema compatibility: idempotency support is optional and must be validated before use.
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'orders'
      AND column_name = 'idempotency_key'
  ) THEN
    -- The function below will use the column safely if present.
    NULL;
  ELSE
    RAISE EXCEPTION 'Required column public.orders.idempotency_key is missing. Add or confirm the live schema before applying this migration.';
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_customer_idempotency_key
  ON public.orders (customer_id, idempotency_key)
  WHERE customer_id IS NOT NULL AND idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_order_items_order_id
  ON public.order_items (order_id);

CREATE INDEX IF NOT EXISTS idx_order_items_product_id
  ON public.order_items (product_id);

CREATE INDEX IF NOT EXISTS idx_inventory_logs_product_id
  ON public.inventory_logs (product_id);

CREATE INDEX IF NOT EXISTS idx_inventory_logs_order_id
  ON public.inventory_logs (order_id);

CREATE OR REPLACE FUNCTION public.place_website_order_atomic(
  p_customer_id text,
  p_customer_name text,
  p_customer_phone text,
  p_shipping_address text,
  p_landmark text DEFAULT NULL,
  p_pincode text DEFAULT NULL,
  p_payment_method text DEFAULT 'cod',
  p_idempotency_key text DEFAULT NULL,
  p_items jsonb DEFAULT '[]'::jsonb
)
RETURNS TABLE (
  id text,
  total numeric,
  subtotal numeric,
  status text,
  payment_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_auth_user uuid;
  v_order_id text;
  v_item jsonb;
  v_quantity integer;
  v_product_id bigint;
  v_product record;
  v_unit_price numeric;
  v_line_total numeric;
  v_subtotal numeric := 0;
  v_total numeric := 0;
  v_previous_stock numeric;
  v_new_stock numeric;
  v_idempotent_order text;
BEGIN
  -- Authentication requires a real authenticated user session.
  v_auth_user := auth.uid();
  IF v_auth_user IS NULL THEN
    RAISE EXCEPTION 'Authentication required for website checkout';
  END IF;

  IF p_customer_id IS NULL OR btrim(p_customer_id) = '' THEN
    RAISE EXCEPTION 'customer_id is required';
  END IF;

  -- Compare the browser identity against auth.uid() safely. This avoids unsafe UUID->BIGINT casting.
  IF v_auth_user::text <> p_customer_id THEN
    RAISE EXCEPTION 'Customer identity mismatch';
  END IF;

  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' THEN
    RAISE EXCEPTION 'items must be a JSON array';
  END IF;

  IF jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Cart is empty';
  END IF;

  IF p_idempotency_key IS NOT NULL THEN
    SELECT o.id
      INTO v_idempotent_order
      FROM public.orders o
     WHERE o.customer_id = p_customer_id
       AND o.idempotency_key = p_idempotency_key
     LIMIT 1;

    IF v_idempotent_order IS NOT NULL THEN
      RETURN QUERY
      SELECT o.id,
             COALESCE(o.total, 0),
             COALESCE(o.subtotal, 0),
             COALESCE(o.status, 'Pending'),
             COALESCE(o.payment_status, 'pending')
        FROM public.orders o
       WHERE o.id = v_idempotent_order;
      RETURN;
    END IF;
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    IF v_item IS NULL OR jsonb_typeof(v_item) <> 'object' THEN
      RAISE EXCEPTION 'Each item must be an object';
    END IF;

    v_product_id := NULLIF((v_item ->> 'product_id')::text, '')::bigint;
    v_quantity := NULLIF((v_item ->> 'quantity')::text, '')::integer;

    IF v_product_id IS NULL OR v_product_id <= 0 THEN
      RAISE EXCEPTION 'Invalid product_id supplied';
    END IF;

    IF v_quantity IS NULL OR v_quantity <= 0 THEN
      RAISE EXCEPTION 'Quantity must be a positive integer';
    END IF;

    IF v_quantity <> (v_item ->> 'quantity')::numeric::integer THEN
      RAISE EXCEPTION 'Quantity must be a whole number';
    END IF;

    SELECT p.*
      INTO v_product
      FROM public.products p
     WHERE p.id = v_product_id
     FOR UPDATE;

    IF v_product.id IS NULL THEN
      RAISE EXCEPTION 'Product not found: %', v_product_id;
    END IF;

    IF v_product.is_deleted = true THEN
      RAISE EXCEPTION 'Product is unavailable: %', v_product_id;
    END IF;

    IF v_product.is_active = false THEN
      RAISE EXCEPTION 'Product is inactive: %', v_product_id;
    END IF;

    v_previous_stock := COALESCE(v_product.stock, 0)::numeric;
    IF v_previous_stock < v_quantity THEN
      RAISE EXCEPTION 'Insufficient stock for product %', v_product_id;
    END IF;

    v_unit_price := COALESCE(
      v_product.sale_rate,
      v_product.onlinerate,
      v_product.online_rate,
      v_product.retail_rate,
      v_product.restrate,
      v_product.selling_price,
      0
    )::numeric;

    IF v_unit_price <= 0 THEN
      RAISE EXCEPTION 'Product price missing for product %', v_product_id;
    END IF;

    v_line_total := v_unit_price * v_quantity;
    v_subtotal := v_subtotal + v_line_total;
  END LOOP;

  v_total := v_subtotal;
  v_order_id := gen_random_uuid()::text;

  INSERT INTO public.orders (
    id,
    customer_id,
    customer_name,
    customer_phone,
    shipping_address,
    landmark,
    pincode,
    subtotal,
    total,
    total_amount,
    payment_method,
    payment_status,
    order_status,
    status,
    created_at,
    updated_at,
    idempotency_key,
    items
  )
  VALUES (
    v_order_id,
    p_customer_id,
    p_customer_name,
    p_customer_phone,
    p_shipping_address,
    p_landmark,
    p_pincode,
    v_subtotal,
    v_total,
    v_total,
    p_payment_method,
    'pending',
    'Pending',
    'Pending',
    now(),
    now(),
    p_idempotency_key,
    p_items
  );

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := NULLIF((v_item ->> 'product_id')::text, '')::bigint;
    v_quantity := NULLIF((v_item ->> 'quantity')::text, '')::integer;

    SELECT p.*
      INTO v_product
      FROM public.products p
     WHERE p.id = v_product_id
     FOR UPDATE;

    v_unit_price := COALESCE(
      v_product.sale_rate,
      v_product.onlinerate,
      v_product.online_rate,
      v_product.retail_rate,
      v_product.restrate,
      v_product.selling_price,
      0
    )::numeric;

    v_line_total := v_unit_price * v_quantity;

    INSERT INTO public.order_items (
      id,
      order_id,
      product_id,
      product_name,
      quantity,
      unit_price,
      line_total,
      created_at,
      updated_at
    )
    VALUES (
      gen_random_uuid()::text,
      v_order_id,
      v_product_id,
      COALESCE(v_product.name, 'Product'),
      v_quantity,
      v_unit_price,
      v_line_total,
      now(),
      now()
    );

    v_previous_stock := COALESCE(v_product.stock, 0)::numeric;
    v_new_stock := v_previous_stock - v_quantity;

    UPDATE public.products
       SET stock = v_new_stock,
           updated_at = now()
     WHERE id = v_product_id;

    INSERT INTO public.inventory_logs (
      id,
      product_id,
      order_id,
      movement_type,
      quantity_delta,
      previous_stock,
      new_stock,
      created_by,
      created_at
    )
    VALUES (
      gen_random_uuid()::text,
      v_product_id,
      v_order_id,
      'sale',
      (v_quantity * -1)::numeric,
      v_previous_stock,
      v_new_stock,
      v_auth_user::text,
      now()
    );
  END LOOP;

  RETURN QUERY
  SELECT o.id,
         COALESCE(o.total, 0),
         COALESCE(o.subtotal, 0),
         COALESCE(o.status, 'Pending'),
         COALESCE(o.payment_status, 'pending')
    FROM public.orders o
   WHERE o.id = v_order_id;

EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;

REVOKE ALL ON FUNCTION public.place_website_order_atomic(
  text, text, text, text, text, text, text, text, jsonb
) FROM public;
REVOKE ALL ON FUNCTION public.place_website_order_atomic(
  text, text, text, text, text, text, text, text, jsonb
) FROM anon;
GRANT EXECUTE ON FUNCTION public.place_website_order_atomic(
  text, text, text, text, text, text, text, text, jsonb
) TO authenticated;

COMMIT;
