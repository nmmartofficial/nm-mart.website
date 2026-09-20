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

  -- The previous tenant patch added two VALUES but not their target columns.
  function_definition := regexp_replace(
    function_definition,
    '(pincode[[:space:]]*,[[:space:]]*)order_number',
    '\1tenant_id, company_code, order_number',
    1,
    1,
    'in'
  );

  IF function_definition = original_definition THEN
    RAISE EXCEPTION 'Website order INSERT target columns were not found';
  END IF;

  EXECUTE function_definition;
END $$;

COMMIT;
