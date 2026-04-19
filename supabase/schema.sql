-- Supabase SQL for products table
-- To run this:
-- 1. Go to your Supabase Dashboard (https://supabase.com/dashboard)
-- 2. Select your project: wcoymnkyqjlncztyabxc
-- 3. Open the "SQL Editor" from the left sidebar
-- 4. Click "+ New query"
-- 5. Paste this SQL and click "Run"

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

-- Create Authenticated Upsert Policy (if using anon/authenticated key with sync)
CREATE POLICY "Allow Authenticated Upsert" ON public.products
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Ensure barcode is unique (already handled by PRIMARY KEY)
-- Create index for faster searching by barcode
CREATE INDEX IF NOT EXISTS products_barcode_idx ON public.products (barcode);
-- Create index for faster searching by name
CREATE INDEX IF NOT EXISTS products_name_idx ON public.products USING gin (name gin_trgm_ops);
-- Note: gin_trgm_ops requires pg_trgm extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS products_name_trgm_idx ON public.products USING gin (name gin_trgm_ops);
