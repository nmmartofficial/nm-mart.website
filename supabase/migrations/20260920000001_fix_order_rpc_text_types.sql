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
  function_definition := regexp_replace(
    function_definition,
    'p_landmark,\s+p_pincode,\s+order_number',
    'p_landmark, p_pincode, tenant_id, company_code, order_number',
    'g'
  );
  function_definition := regexp_replace(
    function_definition,
    'p_landmark,\s+p_pincode,\s+''NM-''',
    'p_landmark, p_pincode, 1, ''NMM001'', ''NM-''',
    'g'
  );

  IF function_definition = original_definition THEN
    RAISE EXCEPTION 'Expected order function expressions were not found';
  END IF;

  EXECUTE function_definition;
END $$;

UPDATE public.orders
SET tenant_id = 1,
    company_code = 'NMM001',
    updated_at = NOW()
WHERE tenant_id IS NULL
  AND company_code IS NULL
  AND order_number LIKE 'NM-%';

COMMIT;
