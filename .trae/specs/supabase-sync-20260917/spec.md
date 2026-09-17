# Supabase Schema Sync - Product Requirements Document

## Overview
- **Summary**: NM MART project ke codebase ko live Supabase database ke actual table/column names ke according sync karna. Supabase schema ko authoritative (source of truth) mana jayega, project ke code/types ko uske according adjust kiya jayega. Live Supabase mein koi modification nahi karni.
- **Purpose**: Database aur project ke beech schema mismatch se hone wale runtime errors, incorrect data reads, aur broken admin workflows ko fix karna.
- **Target Users**: Developers, Admin Dashboard users, Storefront end-users.

## Goals
- Sabhi Supabase table references jo hardcoded unhe `TABLES` constant ke through consistent banana.
- Sabhi TypeScript type definitions (types.ts, schema.ts, inventory.ts, data/products.ts) ko actual Supabase columns ke sath sync karna.
- Jin columns ka code mein reference hai lekin actual Supabase mein nahi hai (jaise badge in products, salerate without underscore) unhe safely handle/fallback karna.
- Outdated local schema.sql file ko actual Supabase structure ke sath update karna.
- Missing/non-existent table references (jaise `highlights` table) ko safely degrade karna (localStorage fallback rakhna).
- Column access helpers (getProductSaleRate etc.) ko verified aur consistent banana.

## Non-Goals
- Supabase database mein koi bhi DDL ya structural changes nahi karna.
- Naye tables create nahi karna (jaise highlights table).
- Business logic ya calculation logic changes nahi karna (sirf schema/naming sync).
- Storage buckets ko create ya modify nahi karna.
- RLS policies ya authentication flows ko change nahi karna.

## Background & Context
**Evidence:**
- Live Supabase project: `mggkadgemqcyybsplkqc.supabase.co`
- Actual public tables (via REST probe on 2026-09-17):
  - `products` = 90 columns (with duplicate aliases like sale_rate/online_rate/retail_rate etc.)
  - `orders` = 47 columns
  - `profiles` = 15 columns
  - `categories` = 11 columns
  - `banners` = 22 columns
  - `highlights` table = 404 / does NOT exist (HighlightsManager hardcodes it)
- Project mein types.ts, schema.ts, inventory.ts, data/products.ts alag-alag type definitions maintain karte hain.
- Kuch jagah hardcoded `.from('orders')`, `.from('profiles')` etc. use ho rahe hain bina TABLES constant ke.
- InventoryTab.tsx mein `product.badge` access hota hai lekin `badge` column actual products table mein nahi hai.
- data/products.ts ke Product interface mein `salerate` (no underscore) aur `image` hain, actual columns `sale_rate` aur `image_url` hain.
- supabase/schema.sql file bahut purana hai — sirf 11 products columns define karta hai, actual mein 90 hain.

## Functional Requirements
- **FR-1**: Sabhi Supabase `.from()` calls, jo existing 5 authoritative tables se relate karte hain, `TABLES.<table>` constant use karenge (direct hardcoded string nahi).
- **FR-2**: `types.ts` ke Database type (products, orders, profiles, categories, banners ke Row types) mein actual live Supabase mein missing columns nahi honge aur extra columns (jo live mein nahi hain) nahi honge.
- **FR-3**: `schema.ts` ke DbProductRow, DbBannerRow, DbCategoryRow, DbProfileRow types — types.ts ke Database["public"]["Tables"][T]["Row"] se derived honge ya 100% match karenge.
- **FR-4**: `inventory.ts` ke InventoryItem interface ko actual products table ke authoritative columns ke sath sync kiya jayega.
- **FR-5**: `data/products.ts` ke Product interface ke field names ko actual Supabase columns ke naming ya mapping ke sath sync kiya jayega.
- **FR-6**: Jin columns ka code mein access hai lekin actual mein nahi hain (e.g. `product.badge` in InventoryTab), unhe safe nullish fallback ke sath wrap kiya jayega bina feature ko todne ke.
- **FR-7**: `highlights` table jo actual Supabase mein nahi hai — HighlightsManager component mein localStorage fallback ko primary path par promote/ensure kiya jayega, aur hard Supabase errors ko handle karne wali logic ko improve kiya jayega.
- **FR-8**: `supabase/schema.sql` (local reference file) ko actual live 5 public tables ke CREATE TABLE definitions se update/replace kiya jayega — jo ki developer reference ke liye hoga, execute nahi karna.

## Non-Functional Requirements
- **NFR-1**: Sabhi changes `npm run build` / `tsc` pass karein koi TS error nahi hona chahiye.
- **NFR-2**: Existing getters helpers (getProductSaleRate, getProductStock, etc.) — existing fallback behavior preserve rakhna chahiye (backward compatible for data synced from old systems).
- **NFR-3**: Storefront aur Admin workflows ka runtime behavior pura same rakhna chahiye — sirf naming/types sync karna hai.
- **NFR-4**: koi bhi new dependency add nahi karna.

## Constraints
- **Technical**: Live Supabase ko read-only treat karo — koi migration, koi DDL, koi table create/alter nahi.
- **Technical**: .env mein diye gaye anon key ka hi use karo (service role nahi allowed spec ke scope mein).
- **Business**: Admin quick edit, inventory update, order status update jaise features ko break nahi karna chahiye.
- **Dependencies**: Koi external new dependency install nahi karna.

## Assumptions
- products table mein duplicate/alias columns (salerate vs sale_rate, onlinerate vs online_rate, retail_rate vs restrate etc.) intentional hain (old ERP sync ke liye) — isliye helpers mein fallback logic preserve rakhna.
- `highlights` table intentionally nahi banaya Supabase mein — localStorage se ka chalana.
- InventoryTab ke `badge` field ko local UI state handle kar sakta hai ya safely ignore kar sakta hai.
- schema.sql file sirf reference hai live SQL script run nahi karna.

## Acceptance Criteria

### AC-1: Table name references are consistently TABLES-constant driven
- **Type**: `rule`
- **Given**: Codebase mein existing Supabase `.from()` calls for products, orders, profiles, categories, banners.
- **When**: Hum src directory ko hardcoded table names ke liye scan karte hain.
- **Then**: products/orders/profiles/categories/banners ke liye koi bhi `.from('hardcoded')` na ho — sabhi `TABLES.<name>` se aayein.
- **Pass Condition**: Grep `\.from\(['"](products|orders|profiles|categories|banners)['"]\)` → 0 matches.
- **Evidence**: grep output + file links.

### AC-2: types.ts Database Row types exactly match live Supabase columns
- **Type**: `rule`
- **Given**: types.ts ke Products Row, Orders Row, Profiles Row, Categories Row, Banners Row.
- **When**: Unke column sets ko live probe ke column set (products=90, orders=47, profiles=15, categories=11, banners=22) ke sath compare karo.
- **Then**: Extra columns na ho, missing columns na ho. Key count exact match kare.
- **Pass Condition**: 5 tables ka column count + exact name set live probe ke JSON se match kare.
- **Evidence**: diff/summary + code links to types.ts.

### AC-3: schema.ts row types are in 100% sync with types.ts
- **Type**: `rule`
- **Given**: schema.ts DbProductRow, DbBannerRow, DbCategoryRow, DbProfileRow.
- **When**: types.ts ke Database["public"]["Tables"][T]["Row] ke sath compare karo.
- **Then**: Har ek optional/required/nullable type match kare.
- **Pass Condition**: har field match kare, koi extra/missing na ho.
- **Evidence**: code links + manual diff summary.

### AC-4: InventoryItem (inventory.ts) is synced to authoritative products columns
- **Type**: `rule`
- **Given**: InventoryItem interface.
- **When**: Columns ko authoritative products row ke sath compare karo.
- **Then**: Fields jo Supabase mein nahi hain unhe hataya/alias kiya jayega aur minimum upsert ke liye jo fields zaruri hain unhe sync kiya jayega.
- **Pass Condition**: koi bhi field aisa na ho jo live products mein nahi ho; optional field types match kare.
- **Evidence**: code link to updated inventory.ts.

### AC-5: data/products.ts Product interface uses actual column names
- **Type**: `rule`
- **Given**: data/products.ts ki local Product interface + mapping.
- **When**: Mapping ko verify karo.
- **Then**: Interface aur mapping mein authoritative column names use karein (e.g. no phantom `salerate` select).
- **Pass Condition**: select statement aur mapped fields live column names use karein; fallback agar ho to documented/typed.
- **Evidence**: code link to updated data/products.ts.

### AC-6: Missing column `badge` handled safely in InventoryTab
- **Type**: `rule`
- **Given**: InventoryTab.tsx line 83 jahan `product.badge` access hota hai.
- **When**: Admin dashboard inventory tab render aur edit hota hai.
- **Then**: JS error nahi aaye — undefined fallback use kare.
- **Pass Condition**: code mein `product.badge` ko safe access ke sath wrap kiya jaye aur type level par bhi undefined handle ho.
- **Evidence**: code link + TS build passing.

### AC-7: Highlights manager gracefully degrades (highlights table missing in Supabase)
- **Type**: `rubric`
- **Dimension**: graceful degradation clarity aur robustness
- **Scale**: 0-2
- **Anchors**: 0 = still hard-fails or spam console; 1 = works but unclear states; 2 = explicit local mode, zero unexpected 404 errors, user ko clear indication mil jaye.
- **Pass Threshold**: >= 2
- **Evidence**: code links + local flow verification.

### AC-8: supabase/schema.sql updated for the 5 authoritative tables
- **Type**: `rule`
- **Given**: supabase/schema.sql.
- **When**: Read karo file ko.
- **Then**: 5 public tables ke accurate CREATE TABLE statements hon (products, orders, profiles, categories, banners) with column types jo live columns se match karein; file ke top par comment ho ki this is reference only, do not run without review.
- **Pass Condition**: file mein 5 tables ke CREATE TABLE hon with correct columns + type mapping (text/numeric/bigint/timestamptz etc.).
- **Evidence**: file contents + code link.

### AC-9: TypeScript build passes without any new errors
- **Type**: `rule`
- **Given**: project in current state.
- **When**: `npx tsc --noEmit` ya `npm run build` run karo.
- **Then**: koi type error nahi hona chahiye.
- **Pass Condition**: exit code 0, no TS errors.
- **Evidence**: command output log.

## Open Questions
- [ ] Kya `badge` field ko products table mein future mein add karne ka plan hai? Abhi ke liye hum safe fallback laga rahe hain. (Approach: safe fallback, no Supabase change — per spec constraints.)
- [ ] Kya `highlights` table ko future mein Supabase mein migrate karna hai? Current scope: localStorage fallback ko robust banana.
