CREATE OR REPLACE FUNCTION public.place_website_order_atomic(
    customer_id text,
    customer_name text,
    customer_phone text,
    shipping_address text,
    landmark text,
    pincode text,
    payment_method text,
    idempotency_key text,
    items jsonb
)
RETURNS TABLE(
    id text,
    total numeric,
    subtotal numeric,
    status text,
    payment_status text
)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT
        r.id::text,
        r.total::numeric,
        r.subtotal::numeric,
        r.status::text,
        r.payment_status::text
    FROM public.place_website_order_atomic_impl(
        p_customer_id       => customer_id,
        p_customer_name     => customer_name,
        p_customer_phone    => customer_phone,
        p_shipping_address  => shipping_address,
        p_landmark          => landmark,
        p_pincode           => pincode,
        p_payment_method    => payment_method,
        p_idempotency_key   => idempotency_key,
        p_items             => items
    ) AS r;
END;
$function$;
