-- Supabase SQL for the active products table.
-- Run this in the SQL Editor for the project configured in .env.

-- Create the products table
CREATE TABLE IF NOT EXISTS public.products (
    barcode TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    mrp NUMERIC DEFAULT 0,
    salerate NUMERIC DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    category TEXT,
    brand TEXT DEFAULT 'Local',
    sub_category TEXT,
    stock_quantity NUMERIC DEFAULT 0,
    image_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create Public Read Access Policy
CREATE POLICY "Allow Public Read Access" ON public.products
    FOR SELECT
    USING (true);

-- Create Authenticated/Service Role Upsert Policy
-- This allows the sync script (using service role or authenticated) to upsert
CREATE POLICY "Allow Service Role Upsert" ON public.products
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create Admin Auth Upsert Policy for dashboard edits
CREATE POLICY "Allow Authenticated Upsert" ON public.products
    FOR ALL
    TO authenticated
    USING ((auth.jwt() ->> 'email') = 'nmmart07@gmail.com')
    WITH CHECK ((auth.jwt() ->> 'email') = 'nmmart07@gmail.com');

-- Ensure barcode is unique (already handled by PRIMARY KEY)
-- Create index for faster searching by barcode
CREATE INDEX IF NOT EXISTS products_barcode_idx ON public.products (barcode);
-- Create index for faster searching by name
CREATE INDEX IF NOT EXISTS products_name_idx ON public.products USING gin (name gin_trgm_ops);
-- Note: gin_trgm_ops requires pg_trgm extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS products_name_trgm_idx ON public.products USING gin (name gin_trgm_ops);
