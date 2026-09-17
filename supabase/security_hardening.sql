-- NM Mart production security hardening
-- Run this in Supabase SQL Editor after confirming the admin Auth email.

-- The admin_config table must never be readable from the browser.
DROP POLICY IF EXISTS "Allow Public Read admin_config" ON public.admin_config;
REVOKE ALL ON TABLE public.admin_config FROM anon, authenticated;

-- Only the configured admin Auth user may mutate products.
DROP POLICY IF EXISTS "Allow Authenticated Upsert" ON public.products;
DROP POLICY IF EXISTS "Allow Admin Product Access" ON public.products;
CREATE POLICY "Allow Admin Product Access" ON public.products
    FOR ALL
    TO authenticated
    USING ((auth.jwt() ->> 'email') = 'nmmart07@gmail.com')
    WITH CHECK ((auth.jwt() ->> 'email') = 'nmmart07@gmail.com');

-- Keep public storefront reads and service-role sync access unchanged.
-- Do not store an admin password in admin_config; use Supabase Auth instead.

-- Restrict admin-managed content writes to the same Auth admin.
DROP POLICY IF EXISTS "Allow Admin All banners" ON public.website_banners;
CREATE POLICY "Allow Admin All banners" ON public.website_banners
    FOR ALL TO authenticated
    USING ((auth.jwt() ->> 'email') = 'nmmart07@gmail.com')
    WITH CHECK ((auth.jwt() ->> 'email') = 'nmmart07@gmail.com');

DROP POLICY IF EXISTS "Allow Admin All categories" ON public.categories;
CREATE POLICY "Allow Admin All categories" ON public.categories
    FOR ALL TO authenticated
    USING ((auth.jwt() ->> 'email') = 'nmmart07@gmail.com')
    WITH CHECK ((auth.jwt() ->> 'email') = 'nmmart07@gmail.com');
