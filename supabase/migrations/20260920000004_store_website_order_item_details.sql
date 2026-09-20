BEGIN;

DO $$
DECLARE
  function_definition text;
  original_definition text;
BEGIN
  SELECT pg_get_functiondef(p.oid)
  INTO function_definition
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND p.proname = 'place_website_order_atomic_impl';

  IF function_definition IS NULL THEN
    RAISE EXCEPTION 'place_website_order_atomic_impl was not found';
  END IF;

  original_definition := function_definition;

  function_definition := replace(
    function_definition,
    'v_total numeric := 0;',
    E'v_total numeric := 0;\n  v_order_items jsonb := ''[]''::jsonb;'
  );

  function_definition := replace(
    function_definition,
    'v_subtotal := v_subtotal + v_line_total;',
    E'v_subtotal := v_subtotal + v_line_total;\n    v_order_items := v_order_items || jsonb_build_array(jsonb_build_object(\n      ''product_id'', v_product_id,\n      ''quantity'', v_quantity,\n      ''name'', v_product.name,\n      ''image_url'', COALESCE(v_product.image_url, v_product.picture, v_product.imagename),\n      ''unit_price'', v_unit_price,\n      ''line_total'', v_line_total\n    ));'
  );

  function_definition := regexp_replace(
    function_definition,
    'p_idempotency_key[[:space:]]*,[[:space:]]*p_items',
    'p_idempotency_key, v_order_items',
    1,
    1,
    'i'
  );

  IF function_definition = original_definition THEN
    RAISE EXCEPTION 'Website order item detail expressions were not found';
  END IF;

  EXECUTE function_definition;
END $$;

COMMIT;
