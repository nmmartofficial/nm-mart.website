BEGIN;

CREATE SEQUENCE IF NOT EXISTS public.website_order_number_seq
  MINVALUE 1
  START WITH 1;

DO $$
DECLARE
  function_definition text;
  original_definition text;
  max_order_number bigint;
BEGIN
  SELECT COALESCE(MAX((substring(order_number from '^NM([0-9]+)$'))::bigint), 0)
  INTO max_order_number
  FROM public.orders;

  IF max_order_number > 0 THEN
    PERFORM setval('public.website_order_number_seq', max_order_number, true);
  ELSE
    PERFORM setval('public.website_order_number_seq', 1, false);
  END IF;

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
    $old$'NM-' || to_char(now(), 'YYYYMMDDHH24MISSMS') || '-' || substr(gen_random_uuid()::text, 1, 6)$old$,
    $new$'NM' || lpad(nextval('public.website_order_number_seq')::text, 3, '0')$new$
  );

  IF function_definition = original_definition THEN
    RAISE EXCEPTION 'Website order number expression was not found';
  END IF;

  EXECUTE function_definition;
END $$;

COMMIT;
