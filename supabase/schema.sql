-- =====================================================================
-- REFERENCE ONLY (auto-generated snapshot of live Supabase public schema)
-- ---------------------------------------------------------------------
-- WARNING: Do NOT run this file directly against production Supabase.
--          Supabase is the source of truth (read-only contract per policy).
--          This file exists ONLY for local dev reference / onboarding docs.
--          Actual authoritative columns = src/lib/supabase/types.ts (Tables<T>)
--          + verified live via anon-key REST probe (17-Sept-2026).
--
-- Authoritative public tables (5)  Status:
--   products   (PK: barcode TEXT, 88 cols)  PRESENT
--   orders     (PK: id TEXT,      47 cols)  PRESENT
--   profiles   (PK: id TEXT,      14 cols)  PRESENT
--   categories (PK: id TEXT,      11 cols)  PRESENT
--   banners    (PK: id TEXT,      22 cols)  PRESENT
--   highlights (non-authoritative, 404/42P01 in live probe) -- DO NOT CREATE
--
-- Type mapping (TS -> Postgres, reference-only):
--   string                  -> TEXT
--   number  (amount/qty/%)  -> NUMERIC
--   number  (row-id style)  -> BIGINT
--   boolean                 -> BOOLEAN
--   string  (ISO datetime)  -> TIMESTAMPTZ
--   Json                    -> JSONB
-- =====================================================================

SET search_path TO public;

-- ---------------------------------------------------------------------
-- 1. products (88 columns, PK = barcode TEXT)
--    ERP-synced duplicate alias columns exist intentionally (backward compat):
--      rate aliases     : sale_rate, onlinerate, online_rate, retail_rate,
--                         restrate, selling_price
--      discount aliases : discount_percent, discount_pct, discperc, discount
--      stock aliases    : stock, opstock, opening_stock
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    -- Primary identifier (ERP barcode)
    barcode                     TEXT PRIMARY KEY,
    name                        TEXT NOT NULL,

    -- Rate / price variants (alias chain -- helpers resolve in this order)
    mrp                         NUMERIC DEFAULT 0,
    sale_rate                   NUMERIC DEFAULT 0,
    retail_rate                 NUMERIC DEFAULT 0,
    restrate                    NUMERIC DEFAULT 0,
    onlinerate                  NUMERIC DEFAULT 0,
    online_rate                 NUMERIC DEFAULT 0,
    selling_price               NUMERIC DEFAULT 0,
    cost_price                  NUMERIC DEFAULT 0,
    purchase_rate               NUMERIC DEFAULT 0,
    purcrate                    NUMERIC DEFAULT 0,
    delivery_rate               NUMERIC DEFAULT 0,
    dlvrate                     NUMERIC DEFAULT 0,
    take_rate                   NUMERIC DEFAULT 0,
    takerate                    NUMERIC DEFAULT 0,

    -- Stock variants (alias chain)
    stock                       NUMERIC DEFAULT 0,
    opstock                     NUMERIC DEFAULT 0,
    opening_stock               NUMERIC DEFAULT 0,

    -- Classification / grouping
    category_name               TEXT,
    item_group_name             TEXT,
    item_group                  TEXT,
    brand_name                  TEXT,
    subcategory_name            TEXT,
    sub_category_name           TEXT,

    -- Discount variants (alias chain)
    discount_percent            NUMERIC DEFAULT 0,
    discount_pct                NUMERIC DEFAULT 0,
    discperc                    NUMERIC DEFAULT 0,
    discount                    NUMERIC DEFAULT 0,
    discount_amount             NUMERIC DEFAULT 0,
    discount_type               TEXT,

    -- Tax fields
    gst_percent                 NUMERIC DEFAULT 0,
    gst_pct                     NUMERIC DEFAULT 0,
    gst                         NUMERIC DEFAULT 0,
    cess_percent                NUMERIC DEFAULT 0,
    cess_pct                    NUMERIC DEFAULT 0,
    cess                        NUMERIC DEFAULT 0,

    -- Media / images
    image_url                   TEXT,
    picture                     TEXT,
    imagename                   TEXT,

    -- Boolean flags
    is_active                   BOOLEAN DEFAULT true,
    is_deleted                  BOOLEAN DEFAULT false,
    is_favourite                BOOLEAN DEFAULT false,
    isfav                       BOOLEAN DEFAULT false,
    is_discountable             BOOLEAN DEFAULT true,
    isdiscountable              BOOLEAN DEFAULT true,
    is_package                  BOOLEAN DEFAULT false,
    ispackage                   BOOLEAN DEFAULT false,

    -- Unit / description variants
    unit_name                   TEXT,
    unitcode                    TEXT,
    description                 TEXT,
    item_description            TEXT,
    itemdescription             TEXT,
    print_name                  TEXT,
    itnameprint                 TEXT,
    item_name                   TEXT,
    itname                      TEXT,

    -- Foreign-code references (ERP / tenant)
    brand_code                  TEXT,
    brandcode                   TEXT,
    brand_id                    TEXT,
    category_code               TEXT,
    category_id                 TEXT,
    sub_category_code           TEXT,
    subcategory_id              TEXT,
    company_code                TEXT,
    tenant_id                   TEXT,
    shop_id                     TEXT,
    shopid                      TEXT,
    department_code             TEXT,
    dtcode                      TEXT,
    hsn_code                    TEXT,
    hsncode                     TEXT,

    -- Other fields
    id                          BIGINT,                    -- numeric row-id (user pref: BIGINT not UUID)
    item_status                 TEXT,
    itemstatus                  TEXT,
    low_stock_threshold         NUMERIC DEFAULT 0,
    max_discount                NUMERIC DEFAULT 0,
    min_selling_price           NUMERIC DEFAULT 0,
    narration                   TEXT,
    narration2                  TEXT,
    item_category               TEXT,
    itc                         TEXT,
    itg                         TEXT,
    kcode                       TEXT,

    -- Audit timestamps
    created_at                  TIMESTAMPTZ DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 2. orders (47 columns, PK = id TEXT -- UUID/cuid style from app)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id                          TEXT PRIMARY KEY,

    -- Order number aliases
    order_id_str                TEXT,
    order_no                    TEXT,
    order_number                TEXT,

    -- Customer identifiers
    user_id                     TEXT,
    customer_id                 TEXT,
    customer_name               TEXT,
    customer_phone              TEXT,
    user_mobile                 TEXT,

    -- Line items & money
    items                       JSONB,
    subtotal                    NUMERIC DEFAULT 0,
    discount                    NUMERIC DEFAULT 0,
    coupon_discount             NUMERIC DEFAULT 0,
    delivery_charge             NUMERIC DEFAULT 0,
    packaging_charge            NUMERIC DEFAULT 0,
    cess_amount                 NUMERIC DEFAULT 0,
    round_off                   NUMERIC DEFAULT 0,
    cgst_amount                 NUMERIC DEFAULT 0,
    sgst_amount                 NUMERIC DEFAULT 0,
    igst_amount                 NUMERIC DEFAULT 0,
    total                       NUMERIC DEFAULT 0,
    total_amount                NUMERIC DEFAULT 0,

    -- Shipping address
    shipping_address            TEXT,
    delivery_address            TEXT,
    landmark                    TEXT,
    pincode                     TEXT,

    -- Payment / status
    payment_method              TEXT,
    payment_mode                TEXT,
    payment_status              TEXT,
    order_type                  TEXT,
    order_status                TEXT,
    status                      TEXT,
    source_ip                   TEXT,
    notes                       TEXT,
    invoice_generated           BOOLEAN DEFAULT false,
    invoice_printed_at          TIMESTAMPTZ,
    cancelled_at                TIMESTAMPTZ,
    delivered_at                TIMESTAMPTZ,

    -- Other refs
    coupon_id                   TEXT,
    is_deleted                  BOOLEAN DEFAULT false,
    cashier_admin_user_id       TEXT,
    delivery_boy_id             TEXT,
    company_code                TEXT,
    tenant_id                   TEXT,

    created_at                  TIMESTAMPTZ DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 3. profiles (14 columns, PK = id TEXT -- maps to auth.uid)
--    Note: dynamic columns like loyalty_points / welfare_status may be
--    added directly in live Supabase (admin panel) and are read via
--    loose casts in WelfareTab; they are omitted here because they were
--    not present at the time of the types.ts regeneration snapshot.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id                          TEXT PRIMARY KEY,
    full_name                   TEXT,
    mobile                      TEXT,
    phone                       TEXT,
    phone_number                TEXT,
    address                     TEXT,
    city                        TEXT,
    state                       TEXT,
    pincode                     TEXT,
    landmark                    TEXT,
    avatar_url                  TEXT,
    role                        TEXT,

    created_at                  TIMESTAMPTZ DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 4. categories (11 columns, PK = id TEXT)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id                          TEXT PRIMARY KEY,
    name                        TEXT NOT NULL,
    image_url                   TEXT,
    description                 TEXT,
    is_active                   BOOLEAN DEFAULT true,
    is_deleted                  BOOLEAN DEFAULT false,
    sort_order                  NUMERIC DEFAULT 0,
    company_code                TEXT,
    tenant_id                   TEXT,

    created_at                  TIMESTAMPTZ DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 5. banners (22 columns, PK = id TEXT)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.banners (
    id                          TEXT PRIMARY KEY,
    name                        TEXT,
    title                       TEXT,
    description                 TEXT,
    image_url                   TEXT,
    link_url                    TEXT,
    link_type                   TEXT,
    link_id                     TEXT,
    linked_product_id           TEXT,
    action_type                 TEXT,
    action_value                TEXT,
    banner_type                 TEXT,
    is_active                   BOOLEAN DEFAULT true,
    is_deleted                  BOOLEAN DEFAULT false,
    sort_order                  NUMERIC DEFAULT 0,
    itname                      TEXT,
    start_date                  TIMESTAMPTZ,
    end_date                    TIMESTAMPTZ,
    company_code                TEXT,
    tenant_id                   TEXT,

    created_at                  TIMESTAMPTZ DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- End of REFERENCE ONLY snapshot.
-- Do NOT append CREATE TABLE "highlights" -- it does not exist in live
-- Supabase (returned 404/42P01). HighlightsManager gracefully degrades
-- to localStorage when the table is absent.
-- =====================================================================
