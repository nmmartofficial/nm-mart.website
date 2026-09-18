BEGIN;

DROP FUNCTION IF EXISTS public.place_website_order_atomic(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  jsonb
);

-- Keep live shared tables intact. Only remove the indexes that were created by this package, if present.
DROP INDEX IF EXISTS public.idx_orders_customer_idempotency_key;
DROP INDEX IF EXISTS public.idx_order_items_order_id;
DROP INDEX IF EXISTS public.idx_order_items_product_id;
DROP INDEX IF EXISTS public.idx_inventory_logs_product_id;
DROP INDEX IF EXISTS public.idx_inventory_logs_order_id;

-- Do not drop live shared tables or columns without explicit schema confirmation.
-- The target database must be verified before any destructive rollback is executed.

COMMIT;
