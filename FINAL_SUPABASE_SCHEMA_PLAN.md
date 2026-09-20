# Final Supabase Schema Plan

Status: Frontend-first plan only. No live Supabase schema changes are performed in this workspace.

## 1. Current repository evidence to reuse

The repo already contains evidence of these shared live schema objects that must be preserved:

- `public.products`
- `public.orders`
- `public.profiles`
- `public.categories`
- `public.banners`
- `public.customer_addresses` (repo migration exists, but runtime execution is not performed here)

Current order architecture is intentionally preserved:

- `orders.id` remains `BIGINT`/TEXT-friendly live contract per repo schema snapshot
- `orders.customer_id` remains customer ownership key
- `orders.items` remains JSONB payload
- `orders.idempotency_key` is retained for secure repeat-safe order submission
- `public.place_website_order_atomic` remains the canonical server-side checkout RPC

## 2. Reused existing tables

### 2.1 `public.profiles`
Purpose: authenticated customer profile record.

Columns:
- `id` TEXT PRIMARY KEY
- `full_name` TEXT NULL
- `mobile` TEXT NULL
- `phone` TEXT NULL
- `phone_number` TEXT NULL
- `address` TEXT NULL
- `city` TEXT NULL
- `state` TEXT NULL
- `pincode` TEXT NULL
- `landmark` TEXT NULL
- `avatar_url` TEXT NULL
- `role` TEXT NULL
- `created_at` TIMESTAMPTZ DEFAULT NOW()
- `updated_at` TIMESTAMPTZ DEFAULT NOW()

Primary key: `id`

Indexes: none required beyond auth relationship; optional index on `mobile` and `phone_number` for lookup.

RLS:
- SELECT: authenticated users can read their own profile; admins may read customer rows if required by admin role
- INSERT: authenticated users can create their own row when matching `auth.uid()`
- UPDATE: authenticated users can update their own row; admin role can update if explicitly granted
- DELETE: not allowed for normal customers; admin only if required

### 2.2 `public.products`
Purpose: product catalog and stock source of truth.

Columns: repo already contains the live ERP-compatible alias set including:
- `barcode` TEXT PRIMARY KEY
- `name` TEXT
- `mrp`, `sale_rate`, `retail_rate`, `restrate`, `onlinerate`, `online_rate`, `selling_price`
- `stock`, `opstock`, `opening_stock`
- `category_name`, `item_group_name`, `brand_name`, `subcategory_name`
- `discount_percent`, `discount_pct`, `discperc`, `discount`
- `is_active`, `is_deleted`
- `image_url`, `picture`
- `company_code`, `tenant_id`
- `created_at`, `updated_at`

Indexes:
- index on `category_name`, `brand_name`, `is_active`, `is_deleted`
- index on `tenant_id`, `company_code` when multi-tenant setup is active

RLS:
- SELECT: public or authenticated readers depending on product visibility policy; do not weaken current live setup
- INSERT/UPDATE/DELETE: admin-only via service/admin role path only

### 2.3 `public.orders`
Purpose: final customer order lifecycle record.

Columns:
- `id` TEXT PRIMARY KEY
- `order_id_str`, `order_no`, `order_number` TEXT NULL
- `user_id`, `customer_id`, `customer_name`, `customer_phone`, `user_mobile` TEXT NULL
- `items` JSONB NULL
- `subtotal`, `discount`, `coupon_discount`, `delivery_charge`, `packaging_charge`, `cess_amount`, `round_off`, `cgst_amount`, `sgst_amount`, `igst_amount`, `total`, `total_amount` NUMERIC
- `shipping_address`, `delivery_address`, `landmark`, `pincode` TEXT NULL
- `payment_method`, `payment_mode`, `payment_status`, `order_type`, `order_status`, `status` TEXT NULL
- `source_ip`, `notes`, `invoice_generated`, `invoice_printed_at`, `cancelled_at`, `delivered_at`, `coupon_id`, `is_deleted`, `cashier_admin_user_id`, `delivery_boy_id`, `company_code`, `tenant_id`
- `created_at`, `updated_at` TIMESTAMPTZ
- `idempotency_key` TEXT NULL

Indexes:
- `idx_orders_customer_idempotency_key` unique partial index on `(customer_id, idempotency_key)` when both are non-null
- index on `customer_id`, `created_at DESC`
- index on `status`, `payment_status`

RLS:
- SELECT: customers can read their own orders; admin can read all
- INSERT: authenticated users can create only their own order rows via secure RPC; not direct client insert
- UPDATE: admin/system only; customers cannot mutate order record after placement
- DELETE: admin-only, soft-delete only via `is_deleted` if required

### 2.4 `public.categories`
Purpose: category navigation and product grouping.

Columns:
- `id` TEXT PRIMARY KEY
- `name` TEXT NOT NULL
- `image_url`, `description` TEXT NULL
- `is_active`, `is_deleted` BOOLEAN
- `sort_order` NUMERIC DEFAULT 0
- `company_code`, `tenant_id`
- `created_at`, `updated_at`

RLS:
- SELECT: public or authenticated when needed
- INSERT/UPDATE/DELETE: admin-only

### 2.5 `public.banners`
Purpose: storefront announcement and promotional content.

Columns:
- `id` TEXT PRIMARY KEY
- `name`, `title`, `description`, `image_url`, `link_url`, `link_type`, `link_id`, `linked_product_id`, `action_type`, `action_value`, `banner_type`, `is_active`, `is_deleted`, `sort_order`, `itname`, `start_date`, `end_date`, `company_code`, `tenant_id`
- `created_at`, `updated_at`

RLS:
- SELECT: public or authenticated depending on marketing visibility
- INSERT/UPDATE/DELETE: admin-only

## 3. Existing migration and table to be planned for final stage

### 3.1 `public.customer_addresses`
Purpose: customer saved delivery addresses; multiple rows per customer; one default row allowed.

Required future final shape:
- `id` BIGINT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY
- `user_id` UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
- `label` TEXT NOT NULL DEFAULT 'Home'
- `full_name` TEXT NULL
- `phone` TEXT NULL
- `address` TEXT NOT NULL
- `landmark` TEXT NULL
- `city` TEXT NULL
- `state` TEXT NULL
- `pincode` TEXT NOT NULL
- `address_type` TEXT NOT NULL DEFAULT 'Home' CHECK (address_type IN ('Home', 'Work', 'Other'))
- `is_default` BOOLEAN NOT NULL DEFAULT FALSE
- `created_at` TIMESTAMPTZ DEFAULT NOW()
- `updated_at` TIMESTAMPTZ DEFAULT NOW()

Indexes:
- index on `(user_id, is_default)`
- index on `(user_id, created_at DESC)`
- unique partial index: `(user_id, is_default)` with `is_default = true` restricted to one default row

RLS:
- SELECT: authenticated users can read their own addresses
- INSERT: authenticated user can create on their own `user_id`
- UPDATE: authenticated user can update their own addresses, including toggling default status
- DELETE: authenticated user can delete their own addresses

## 4. Final wallet architecture

Wallet is not to be implemented with random demo data or browser-only storage.

Required end-state architecture:

### 4.1 `public.wallets`
Purpose: current wallet balance for each customer.

Columns:
- `id` BIGINT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY
- `user_id` UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE
- `balance` NUMERIC NOT NULL DEFAULT 0
- `currency` TEXT NOT NULL DEFAULT 'INR'
- `status` TEXT NOT NULL DEFAULT 'active'
- `created_at`, `updated_at` TIMESTAMPTZ

RLS:
- SELECT: authenticated user can read their own wallet
- INSERT: only server/admin-side creation via secure function
- UPDATE: only via secure RPC or admin adjustment function
- DELETE: no direct customer delete

### 4.2 `public.wallet_transactions`
Purpose: immutable ledger for wallet movement.

Columns:
- `id` BIGINT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY
- `wallet_id` BIGINT NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE
- `user_id` UUID NOT NULL REFERENCES auth.users(id)
- `entry_type` TEXT NOT NULL CHECK (entry_type IN ('credit', 'debit', 'refund', 'cashback', 'admin_adjustment'))
- `amount` NUMERIC NOT NULL CHECK (amount > 0)
- `currency` TEXT DEFAULT 'INR'
- `reference_type` TEXT NULL
- `reference_id` TEXT NULL
- `reason` TEXT NULL
- `created_at` TIMESTAMPTZ DEFAULT NOW()

Indexes:
- index on `(user_id, created_at DESC)`
- index on `(wallet_id, created_at DESC)`

RLS:
- SELECT: customer can read their own wallet transactions only
- INSERT: service/admin only
- UPDATE: no direct updates; ledger is append-only
- DELETE: no direct delete

### 4.3 Secure wallet RPC
Required final function:
- `public.adjust_wallet_balance(p_user_id uuid, p_delta numeric, p_reason text, p_reference_type text, p_reference_id text)`
- security definer
- transaction-safe
- updates wallet balance atomically
- inserts wallet transaction row
- rejects negative balance if not allowed by policy

If no payment gateway exists for top-up, the frontend should keep “Add Money” disabled or unavailable until that backend is implemented.

## 5. Coupons and rewards
Future design:

### `public.coupons`
- `id` TEXT PRIMARY KEY
- `code` TEXT UNIQUE NOT NULL
- `title` TEXT
- `discount_type` TEXT CHECK IN ('percent', 'flat')
- `discount_value` NUMERIC
- `min_order_value` NUMERIC
- `expires_at` TIMESTAMPTZ
- `is_active` BOOLEAN DEFAULT TRUE
- `created_at`, `updated_at`

### `public.customer_coupon_usage`
- `id` BIGINT PRIMARY KEY
- `user_id` UUID
- `coupon_id` TEXT
- `used_at` TIMESTAMPTZ
- `order_id` TEXT NULL

RLS:
- customer sees own usage
- admin manages coupons

## 6. Notifications and support

### `public.notification_preferences`
- `user_id` UUID PRIMARY KEY
- `order_updates` BOOLEAN DEFAULT TRUE
- `promotional_updates` BOOLEAN DEFAULT TRUE
- `offers` BOOLEAN DEFAULT TRUE
- `updated_at`

### `public.support_tickets`
- `id` BIGINT PRIMARY KEY
- `user_id` UUID
- `subject` TEXT
- `message` TEXT
- `status` TEXT DEFAULT 'open'
- `created_at`

## 7. Product reviews
If the final product review feature is desired, use a dedicated table:

### `public.product_reviews`
- `id` BIGINT PRIMARY KEY
- `product_barcode` TEXT REFERENCES public.products(barcode)
- `user_id` UUID
- `rating` INTEGER CHECK (rating BETWEEN 1 AND 5)
- `review_text` TEXT NULL
- `created_at`

## 8. Configuration tables

### `public.store_config`
Purpose: serviceable pincodes and storefront flags.

Columns:
- `key` TEXT PRIMARY KEY
- `value` JSONB
- `description` TEXT
- `updated_at`

This table is already implied by repo logic `store_config` and is useful for safe dynamic pincode serviceability.

## 9. Final migration strategy

Planned final migration order:
1. Required extensions
2. Existing table validation and safe updates
3. New tables with `CREATE TABLE IF NOT EXISTS`
4. Missing columns `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`
5. Foreign keys / constraints
6. Indexes / unique indexes
7. RPC functions `CREATE OR REPLACE FUNCTION`
8. Trigger functions and triggers
9. RLS enablement
10. Policies
11. Seed/configuration records only if necessary

## 10. Important safeguards

- Do not drop or break the existing `public.orders` architecture
- Do not replace the secure checkout RPC with a browser-side flow
- Do not create duplicate order tables or duplicate delivery tables.
- Do not allow wallet balance mutation from frontend code
- Do not execute this migration in the current workspace
- This file is a blueprint only, for controlled manual execution in a verified Supabase environment

## 11. Frontend data-access contract

Frontend access should be centralized under `src/lib/supabase/` by module:

- `profiles.ts`
- `addresses.ts`
- `wallet.ts`
- `orders.ts`
- `coupons.ts`
- `notifications.ts`
- `support.ts`

These modules should expose typed functions and remain UI-agnostic. Raw Supabase queries should not be spread across React components.

## 12. Mock development layer

Temporary demo data should live in a single development-only file such as:

- `src/lib/mockData/` or a clearly named `development/` module

This includes any mock wallet totals, example coupons, or placeholder addresses during the frontend phase only. They must be removable in one place when final Supabase wiring is enabled.

## 13. Final status

This is a pre-connection architecture package only.

- Frontend modules: designed and implemented at UI level
- Database requirements: audited and documented
- Existing tables reused: yes
- New tables planned: yes, only for final stage
- Existing RPC reused: yes, `place_website_order_atomic`
- New RPCs planned: wallet adjustment RPC, address default-management RPC if needed
- RLS: planned and safe
- Index: planned
- Final migration file: created separately as `FINAL_SUPABASE_MIGRATION.sql`
- Supabase connection status: not connected; this remains frontend-only until execution and verification in the target database
