# NM Mart website checkout database contract

## Status

This document describes the website checkout database contract deployed to the shared Supabase project.

## Environment note

The project config points to the live Supabase project `mggkadgemqcyybsplkqc`. Live SQL verification and migration deployment were completed on 2026-09-20.

## Shared architecture

The project uses a shared Supabase database as the single source of truth for Admin, Website, and Android consumers. The Website must not create separate product/order/stock databases.

## Actual repo schema evidence used

The local repo snapshot shows these shared schema shapes:

- `public.products`
  - `barcode` primary key
  - `name`, `mrp`, `sale_rate`, `stock`, `is_active`, `is_deleted`, `company_code`, `tenant_id`, `id` (numeric row id)
- `public.orders`
  - `id`, `customer_id`, `customer_name`, `customer_phone`, `shipping_address`, `landmark`, `pincode`, `items`, `subtotal`, `total`, `payment_method`, `status`, `payment_status`, `created_at`, `updated_at`, `company_code`, `tenant_id`
- `public.profiles`
  - `id`, `full_name`, `mobile`, `phone`, `role`, `created_at`, `updated_at`

The supplied live `public.orders` definition stores website line items in `items jsonb`; this checkout package therefore does not require a separate `order_items` table. Stock is validated and deducted from the authoritative `public.products` rows inside the RPC transaction.

## RPC contract prepared

RPC name: `public.place_website_order_atomic`

Arguments (conceptual):
- `p_customer_id text`
- `p_customer_name text`
- `p_customer_phone text`
- `p_shipping_address text`
- `p_landmark text`
- `p_pincode text`
- `p_payment_method text`
- `p_idempotency_key text`
- `p_items jsonb`

Return value:
- `id text`
- `total numeric`
- `subtotal numeric`
- `status text`
- `payment_status text`

Security requirements:
- require `auth.uid()`
- compare `auth.uid()::text` with the supplied `p_customer_id` only after validation
- reject anonymous requests
- reject mismatched customer ownership
- ignore browser-supplied price/stock/totals
- calculate totals server-side
- lock relevant products in a transaction
- create the `public.orders` row with `items jsonb`, then deduct stock in the same transaction
- enforce idempotency using `(customer_id, idempotency_key)`; the migration adds this nullable column if absent

Important limitations:
- A real authenticated checkout should still be used to verify the full customer-to-admin workflow after deployment.

## Functions included in the migration package

- `public.place_website_order_atomic(...)`

## Compatibility note

- Admin panel compatibility is not live-verified in this workspace.
- Android compatibility is unknown because Android source is unavailable.
- The migration intentionally avoids changing `public.place_order_atomic` or other shared order logic without a verified live compatibility inspection.

## Required production verification before execution

Before applying the migration in production, the DB operator must verify:

1. live `public.products` columns and stock field names
2. live `public.orders` columns and status/payment fields
3. live `public.profiles` customer mapping
4. admin consumer usage of `public.place_order_atomic`
5. grants and RLS on `public.orders` / `public.products`
6. stock and order concurrency requirements
7. whether the final website checkout should be `authenticated-only`

## Execution status

The checkout migrations are applied to the shared Supabase project:

- live DB execution: APPLIED
- production checkout function: patched
- tenant/company INSERT columns: verified
- unauthenticated checkout: rejected as expected
- migration applied: YES
