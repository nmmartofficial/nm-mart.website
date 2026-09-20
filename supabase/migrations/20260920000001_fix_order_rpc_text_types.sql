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
    'COALESCE(o.payment_status, ''pending'')',
    '(COALESCE(o.payment_status, ''pending''))::text'
  );
  function_definition := replace(
    function_definition,
    'COALESCE(o.status, ''pending'')',
    '(COALESCE(o.status, ''pending''))::text'
  );

  IF function_definition = original_definition THEN
    RAISE EXCEPTION 'Expected order return expressions were not found';
  END IF;

  EXECUTE function_definition;
END $$;

COMMIT;
