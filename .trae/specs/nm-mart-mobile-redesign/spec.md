# NM MART Mobile Website Redesign - Product Requirements Document

## Overview
- **Summary**: Complete mobile-first redesign of the NM Mart e-commerce homepage and core components to match a professional grocery/wholesale mobile app UX/UI reference pattern. The redesign applies a purpose-built mobile shopping interface hierarchy while retaining all existing desktop adaptations.
- **Purpose**: Transform the current "desktop-squeezed" mobile experience into a native-feeling mobile grocery shopping application with proper card proportions, navigation patterns, scrolling behavior, and visual hierarchy — exactly as demonstrated in the reference video's UX pattern.
- **Target Users**: Mobile shoppers (320px–430px viewport) of NM Mart, a wholesale/retail grocery store in Manjhanpur, Kaushambi, UP.

## Goals
1. Deliver a mobile-first homepage that visually matches the professional grocery app UX quality level of the reference video.
2. Adhere strictly to the visual hierarchy: Ticker → Header → Search → Delivery → Banner → Categories → Brands → Products → Offers → Footer → Bottom Nav.
3. Ensure 100% of displayed data flows from the existing Supabase database. Zero fake/demo/hardcoded data of any kind.
4. Remove all internal product codes (purely numeric values like 72/73) from the customer-facing product cards.
5. Fix all mobile sizing: product card proportions, category circles, typography, grid gaps, safe-area spacing.
6. Add a professional mobile bottom navigation and reposition the WhatsApp button to avoid content overlap.
7. Preserve 100% of existing desktop experience — mobile-only optimizations, not a desktop break.

## Non-Goals
1. Modify the live Supabase database schema, tables, or columns. No DDL changes.
2. Add a standalone `brands` or `offers` database table. Brands and offers continue to be derived from product fields and existing banner data.
3. Implement the reference video's exact brand names, logos, product images, prices, locations, or proprietary copy.
4. Rewrite the existing React Router page tree or introduce a new state management system.
5. Replace the existing `useProducts` / `useCart` hooks or Supabase client layer.
6. Create demo/placeholder sections that have no real data in Supabase. Empty sections hide gracefully.

## Background & Context
- **Stack**: React 19 + TypeScript + Vite + Tailwind CSS + Supabase (Postgres + Auth + Storage) + React Router + Framer Motion + Sonner + Lucide.
- **Live Database Schema (authoritative, read-only)**:
  - `products` (88 cols, PK: `barcode`) — all catalog fields with multiple rate/stock/discount aliases
  - `orders` (47 cols) — customer orders with addresses/pincodes
  - `profiles` (14 cols) — user profile including `address`, `city`, `pincode`
  - `categories` (11 cols, PK: `id`) — category name + `image_url`
  - `banners` (22 cols) — hero banners with `image_url`, `title`, `link_url`
  - No `highlights` table exists (confirmed 404) — uses localStorage fallback per prior sync.
  - No standalone `brands` table — brands derived from `products.brand_name`.
  - No standalone `offers` table — offers derived from products with `discount > 0` and banners.
- **Existing Code Inventory (audited)**:
  - `HomePage.tsx` — assembles Banner → Categories → Popular Products → Offers → Brands. Currently missing delivery row and bottom nav. Section order differs from target.
  - `ProductCard.tsx` — `min-h-[330px]` cards. Already filters purely-numeric unit values (line 74). Displays discount badge, stock status, MRP strike-through, Save amount, Add to Cart button.
  - `Navbar.tsx` (re-exported as `Header.tsx`) — Sticky header with logo, Account dropdown, Cart button, mobile-only Search row below. No compact mobile delivery row.
  - `HeroBanner.tsx` — Carousel with prev/next, dot indicators, 5s auto-rotate. Uses `banners` table.
  - `Footer.tsx` — 4-column desktop, contains correct real store info from `STORE_DETAILS`.
  - `WhatsAppButton.tsx` — Fixed at `bottom-[calc(1.1rem+env(safe-area-inset-bottom))]`. Does not account for future bottom nav.
  - `AnnouncementTicker.tsx` — Thin dark marquee ticker already exists with correct content. Mounted in `App.tsx` globally.
  - **No Bottom Navigation** component exists yet.
- **Data Sources**:
  - Products/Categories/Brands → `useProducts()` hook which calls `TABLES.products` and `TABLES.categories`
  - Banners → `fetchActiveBanners()` helper → `TABLES.banners`
  - Store Info → `STORE_DETAILS` constant in `store-utils.ts`
  - Location/Pincode → `profiles` table (user-specific) + `storeConfig.ts` pincodes array
- **Prior Sync Artifacts**: `TABLES` constant in `schema.ts` is used for all Supabase calls. Row types are `Tables<T>` aliases. No hardcoded table strings remain.

## Functional Requirements

### Announcement Ticker
- **FR-1**: The existing `AnnouncementTicker` must remain as a THIN single-line auto-scrolling marquee (R→L, seamless loop, compact height ~34px). Do NOT replace with a large announcement box.

### Header (Mobile)
- **FR-2**: Compact mobile header row with:
  - Left: NM MART logo (circular container) + optional abbreviated store name
  - Right (in order): Account icon/button → Cart (with badge count) → Menu (mobile-only hamburger)
- **FR-3**: FULL-WIDTH search bar placed DIRECTLY BELOW the header row (not inline), with placeholder: "Search products, brands & categories". Must route to existing `/shop?search=` flow.
- **FR-4**: Continue using existing Account dropdown, Cart drawer/routing, Menu drawer logic.

### Delivery / Location Row
- **FR-5**: Compact delivery row (below Search, above Banner) with format `📍 Deliver to → [Location] → Change`.
- **FR-6**: Location data MUST come from real sources only:
  - If user is logged in → `profiles` table (address/city/pincode)
  - Else → default store address from `STORE_DETAILS` in `store-utils.ts`
  - NEVER display fake locations like Lucknow.
- **FR-7**: "Change" button routes to existing flow (`/profile` to edit or `/contact` if profile edit not yet available).

### Hero Banner Carousel
- **FR-8**: Mobile-optimized hero carousel using ONLY real `banners` table rows (filtered by `is_active=true`, sorted by `sort_order`).
- **FR-9**: Banner container has mobile-friendly aspect ratio (not excessively tall). Supports click via existing `link_url` field.
- **FR-10**: If zero active banners → show clean empty state OR omit section entirely. Never invent banners.

### Shop by Category
- **FR-11**: Section heading "SHOP BY CATEGORY" + subheading "BROWSE CATEGORIES".
- **FR-12**: Categories are large circular cards (approx 80–95px diameter on 390px viewport), horizontal swipe carousel (no visible native scrollbar), object-fit contain, category name DIRECTLY below (readable, max 2 lines, centered).
- **FR-13**: Data source priority:
  1. `categories` table rows (where `is_active=true`) → use `image_url` via `resolveStorageImageUrl(..., "categories")`
  2. Fallback: first product's image for that category from `allProducts`
  3. Final fallback: 2-letter abbreviation chip
- **FR-14**: Clicking category routes to `/shop?category=<encoded>` (existing flow).

### Brands (Brands You Love)
- **FR-15**: Brand section renders ONLY if real unique brand data exists (derived from `products.brand_name`). Hide if empty.
- **FR-16**: Same circular card pattern as categories, but smaller/larger as appropriate, horizontal swipe.
- **FR-17**: Brand images use product image fallback per brand (first product image matching that brand). No fake logos.

### Product Sections
- **FR-18**: Only render a product section if real data exists for it. Do NOT force sections.
- **FR-19**: Sections to evaluate (conditional):
  - Popular Products (in-stock products)
  - Featured Products (`is_favourite=true`)
  - Special Offers / Deals (products with `discount > 0`, sorted by discount desc)
  - Flat 50%+ (`discount >= 50`) if data exists
  - Flat 33%+ (`discount >= 33` and `< 50`) if data exists
  - New Arrivals (sorted by `created_at` desc) — if meaningful data present
- **FR-20**: Section order follows the target hierarchy (Categories → Brands → Popular/Best → Offers).

### Product Card (Customer-Facing)
- **FR-21**: Professional 2-column mobile grid (390px: 12-16px page padding, 10-12px grid gap). Cards use nearly all available width. No tiny cards.
- **FR-22**: Card structure:
  - Top-left: Discount % badge (ONLY if real discount)
  - Large product image area with `object-fit: contain`, consistent height, no distortion
  - Stock status (In Stock / Out of Stock)
  - Product Name: 12–14px, line-clamp-2
  - Size/Unit line: ONLY if real non-numeric unit. Hide if purely numeric/internal.
  - Price area: Sale price (16-18px bold) + MRP strike-through (if sale < MRP) + Save amount (optional)
  - Full-width ADD TO CART button (40–44px height, 11-12px text, inside card, uses existing `useCart.addToCart`)
- **FR-23**: Remove ALL internal numeric product codes from customer-facing display. Specifically:
  - If `subCategory` or `unit` matches `/^[\d]+$/` → do NOT render.
  - No internal SKU/brand codes (e.g. "72", "73") visible between product name and price.
  - Database values remain untouched — only customer UI changes.
- **FR-24**: Product image area is visually prominent — never squeezed. Consistent image height across cards.

### Offers Section
- **FR-25**: If real offer data exists → attractive section. Sources: banners with `banner_type=offer` OR high-discount products.
- **FR-26**: Zero invented offers.

### Footer
- **FR-27**: Clean mobile footer. Real NM Mart info ONLY:
  - Store name "NM MART" + slogan "SHOP MORE, SAVE MORE"
  - Address: "Naya Nagar, Dhata Road, Manjhanpur, Kaushambi, UP, PIN-212207" (from STORE_DETAILS)
  - Website: NMmart.in
  - Phone: +91 8282827240 (from STORE_DETAILS)
- **FR-28**: No fake info.

### Bottom Navigation (Mobile)
- **FR-29**: New professional fixed bottom navigation — MOBILE ONLY (hidden ≥768px).
- **FR-30**: Items must link to REAL existing routes. Minimum viable set (hide items where route does not exist):
  - Home → `/` (exists)
  - Categories → `/shop` (exists, opens browse)
  - Offers → `/shop?offers=true` (if implemented) OR anchor `#offers` on homepage
  - Orders → `/orders` (exists)
  - More → opens existing drawer or `/profile`
- **FR-31**: Safe-area aware (`env(safe-area-inset-bottom)`). Does not cover page content — page content has bottom padding equal to nav height + safe area. Comfortable 48px+ touch targets.

### WhatsApp Floating Button
- **FR-32**: Position above bottom navigation on mobile (if bottom nav exists), so never covers cart button, price, product image.
- **FR-33**: Use existing WA number `WA_NUMBER` from `store-utils.ts`.

### Section Visibility / Empty States
- **FR-34**: For every section: if real data is empty → either hide the section completely OR render a clean professional empty state (dashed border + icon + text). Never "no data" + a grid of fake placeholder cards.

### Data Integrity (NON-NEGOTIABLE)
- **FR-35**: Supabase is the SINGLE SOURCE OF TRUTH. At no point may this implementation introduce:
  - Static `const products = [...]`, `const categories = [...]`, `const brands = [...]` with demo values.
  - Hardcoded sample product names, prices, discount percentages.
  - Fake brands, fake categories, fake banners, fake offers, fake locations.
- **FR-36**: All existing Supabase queries, `TABLES` constant usage, and helper functions (`getProductMrp`, etc.) remain the data layer.

### Desktop Preservation
- **FR-37**: All changes must be mobile-first (≤767px). Desktop (≥768px) layouts continue to work with existing responsive adaptations — no CSS that breaks desktop grid columns, banner sizing, or navigation.

## Non-Functional Requirements
- **NFR-1 (Responsive)**: Tested widths: 320px, 360px, 375px, 390px, 414px, 430px, 768px, Desktop. At every mobile width: zero horizontal overflow, no clipped images/text, no overlapping buttons, categories swipe, product grid works, bottom nav doesn't cover content, WA button clear.
- **NFR-2 (Performance)**:
  - Lazy-load images (existing `loading="lazy"` preserved).
  - No unnecessary re-renders or duplicate Supabase calls.
  - Continue using `useProducts()` as the single catalog fetch hook; re-use its `categories`, `brands`, `featuredProducts`, `flat50`, `flat33` return values instead of issuing fresh queries.
- **NFR-3 (Build Quality)**:
  - `npx tsc --noEmit` → 0 errors
  - Vite production build (`npx vite build`) → success
  - No hardcoded Supabase table strings (all via `TABLES` constant)
- **NFR-4 (Accessibility)**: Existing ARIA labels on buttons preserved. Focus-visible outlines preserved.
- **NFR-5 (Code Conventions)**:
  - File-at-a-time changes.
  - DRY: Reuse BrandCategoryCard pattern via prop variants rather than duplicating JSX.
  - Tailwind utility classes exclusively. No new global CSS unless needed for animation keyframes.
  - All components TypeScript-typed.

## Constraints
- **Technical**:
  - React 19, TypeScript strict, Vite, Tailwind CSS, existing Framer Motion + Lucide icons.
  - Cannot add new npm packages without user approval (use existing stack).
  - No schema DDL on the live Supabase database.
  - Continue using `TABLES` constant for all `.from()` calls.
  - Use `DbProductRow` / `Tables<"products">` and schema helpers; do not access raw unaliased column names directly in components.
- **Business**:
  - Zero fake data anywhere. Section omission is preferred over placeholder content.
  - Internal product codes must never appear on customer UI.
  - NM Mart branding only (store name, colors, slogan).
- **Dependencies**:
  - Existing routes: `/`, `/shop`, `/cart`, `/orders`, `/profile`, `/login`, `/product/:slug`, `/checkout`, `/delivery`, `/contact`, `/about`, `/tracker`, `/privacy`.
  - Existing hooks: `useProducts()`, `useCart()`, `useTheme()`.
  - Existing Supabase tables: products, orders, profiles, categories, banners.

## Assumptions
1. The reference video's visual structure is the UX pattern target; the user confirms it has been watched.
2. The user explicitly asked us not to copy the reference site's proprietary data, so we will adapt layout/spacing/behavior only.
3. "Brands" data set is derived from product brand_name field (no brands table), which is acceptable per user's "use real existing data" rule.
4. Since no dedicated offers/discounts table exists, banners + high-discount products form the offers section basis.
5. No reference-video-specific features (e.g., dedicated offers page route) will be invented; `/shop` with query params or page anchors will be used.

## Acceptance Criteria

### AC-1: Announcement Ticker Correctness
- **Type**: `rule`
- **Given**: App loaded at 390px viewport
- **When**: Observing the very top of page
- **Then**: A thin ~34px dark marquee ticker is visible with NM MART UPDATE IN PROGRESS content, scrolling R→L, seamless loop, one line.
- **Pass Condition**: Ticker matches existing `AnnouncementTicker.tsx` behavior; no large multi-line announcement banner present.
- **Evidence**: Visual screenshot + `AnnouncementTicker` still imported in App.tsx; `SiteUpdateBanner` not used on homepage.

### AC-2: Mobile Header + Search Layout
- **Type**: `rule`
- **Given**: 390px viewport, homepage loaded
- **When**: Checking top area below ticker
- **Then**: Header row = logo (L) + Account/Cart/Menu (R). Immediately below = single full-width search bar with placeholder "Search products, brands & categories". Search submit routes to `/shop?search=...`.
- **Pass Condition**: DOM order: header → search. Search spans full container width. On submit navigates to /shop with correct query param.
- **Evidence**: DOM structure check + navigation test.

### AC-3: Delivery Row Uses Real Location Only
- **Type**: `rule`
- **Given**: Homepage at 390px
- **When**: Delivery row is rendered
- **Then**: Location string is either user's real profile address OR store's real address (STORE_DETAILS). No fake city like "Lucknow". Change button links to real route.
- **Pass Condition**: String contains "Naya Nagar, Dhata Road, Manjhanpur, Kaushambi" or logged-in user address; no hardcoded fake location in JSX source.
- **Evidence**: Source grep + runtime value check.

### AC-4: Hero Banner Zero Fake Data
- **Type**: `rule`
- **Given**: Homepage loaded
- **When**: Hero banner section exists
- **Then**: All banners are real rows from Supabase `banners` table (images, titles). Section is hidden/empty-state if zero active banners.
- **Pass Condition**: No hardcoded banner images/text in HomePage or HeroBanner; data flows via `fetchActiveBanners` / TABLES.banners.
- **Evidence**: Source audit + network tab.

### AC-5: Categories Correct Size & Data Source
- **Type**: `rule`
- **Given**: Homepage at 390px
- **When**: Shop by Category section
- **Then**: Circular category cards ~80–95px diameter, horizontal swipe, no scrollbar. Images from categories table first, then product fallback. Names are real category names. Click → `/shop?category=`.
- **Pass Condition**: All names exist in products.category_name or categories table; no hardcoded category name array.
- **Evidence**: Runtime name verification against Supabase + source audit.

### AC-6: Brands Section Only If Real Data
- **Type**: `rule`
- **Given**: Homepage at 390px
- **When**: Brands section exists
- **Then**: Every brand name is a real brand_name from products. No fake brand names/logos.
- **Pass Condition**: If brands array from useProducts is empty → section hidden/not rendered. All rendered brand values present in products set.
- **Evidence**: Source conditional check + runtime value cross-check.

### AC-7: Product Card — No Internal Numeric Codes
- **Type**: `rule`
- **Given**: Any product card on homepage at 390px
- **When**: Reading vertically: name → unit → price
- **Then**: NO purely numeric strings appear (no "72", "73", etc). unit/subCategory only if non-numeric.
- **Pass Condition**: Regex `/^[\d]+$/` check on every rendered text node between product name and price yields zero matches.
- **Evidence**: DOM snapshot + filter logic check in ProductCard.

### AC-8: Product Card Proportions & Grid
- **Type**: `rubric`
- **Dimension**: Mobile card visual proportions and grid spacing
- **Scale**: 1–5
- **Anchors**:
  - 1 = Cards are tiny/squished, images small, gaps uneven, horizontal overflow present
  - 3 = Decent grid but cards/images still noticeably smaller than reference video quality level
  - 5 = Near-reference proportions: 2-col at 390px, 12-16px page padding, 10-12px gap, image visually prominent, button fully inside card (40-44px tall), text readable at sizes in spec
- **Pass Threshold**: ≥ 4
- **Evidence**: Screenshot at 390px overlay with measurements + typography sizes.

### AC-9: Product Card Add to Cart Uses Real Cart Logic
- **Type**: `rule`
- **Given**: Logged-in or guest user on homepage
- **When**: Clicking "Add to Cart" on an in-stock product
- **Then**: Existing `useCart().addToCart` called; cart badge count increments; cart drawer reflects item. Out-of-stock products disable the button.
- **Pass Condition**: Button `onClick` calls existing cart add (same function as before). Cart count value in header matches.
- **Evidence**: Click test + state check.

### AC-10: Bottom Navigation (Mobile)
- **Type**: `rule`
- **Given**: 390px viewport, homepage
- **When**: Scrolled to any position
- **Then**: Fixed bottom nav visible with ≥ 4 real routes (Home / Categories / Orders / More at minimum). Each icon button navigates to real page. On ≥768px it is hidden. Page has bottom padding ≥ nav height so content is never covered.
- **Pass Condition**: All nav items have real `to` paths; navigation works; no coverage on scroll; desktop hidden.
- **Evidence**: Navigation tests + viewport tests at 390 vs 1024px.

### AC-11: WhatsApp Button Position
- **Type**: `rule`
- **Given**: 390px viewport with bottom nav enabled, homepage bottom area
- **When**: Product cards bottom row + bottom nav + WA button
- **Then**: WA button sits ABOVE the bottom navigation (not overlapping nav, not overlapping Add to Cart buttons on bottom product row). Safe-area aware.
- **Pass Condition**: Visual overlap test — no content covered.
- **Evidence**: Screenshot with bounding box annotations.

### AC-12: Supabase Single Source of Truth (NO FAKE DATA)
- **Type**: `rule`
- **Given**: Full source code after changes
- **When**: Grep for hardcoded data patterns: `const products = \[`, `const categories = \[`, `const brands = \[` with object literals inside components; literal price numbers; fake category names
- **Then**: Zero fake/hardcoded data arrays introduced. All visible values flow from Supabase queries or store constants.
- **Pass Condition**: Grep returns zero instances of data arrays with fake content; no new file under src/data/ with demo arrays.
- **Evidence**: Grep output + code review of modified files.

### AC-13: Section Visibility Follows Data
- **Type**: `rule`
- **Given**: Runtime state where a section's data is empty (e.g. no offers)
- **When**: Rendering homepage
- **Then**: Section is either fully hidden or shows a dashed empty state. Grid skeleton/placeholder cards of "sample products" are never rendered.
- **Pass Condition**: Every section component has explicit data-empty branch that hides or shows empty state.
- **Evidence**: Source code branch inspection.

### AC-14: Footer Real Info
- **Type**: `rule`
- **Given**: Mobile footer on homepage
- **When**: Reading footer copy
- **Then**: Store name = NM MART, slogan = SHOP MORE SAVE MORE, address = real store address, phone = +91 8282827240, website = NMmart.in. No invented info.
- **Pass Condition**: All strings match STORE_DETAILS and existing Footer. No fake fields added.
- **Evidence**: DOM text check.

### AC-15: Responsive — No Horizontal Overflow (Mobile Widths)
- **Type**: `rule`
- **Given**: Browser DevTools at 320px / 360px / 390px / 430px
- **When**: `document.documentElement.scrollWidth === clientWidth` check on homepage
- **Then**: Zero horizontal scrollbar or overflow; no clipped off-screen content.
- **Pass Condition**: scrollWidth === clientWidth at all 4 widths.
- **Evidence**: DevTools measurement output per width.

### AC-16: Desktop Not Broken
- **Type**: `rule`
- **Given**: 1280px+ viewport
- **When**: Homepage fully loaded
- **Then**: Existing desktop grid/category layout intact (no 2-col forced); header search remains inline; bottom nav hidden; footer 4-col grid visible.
- **Pass Condition**: Visual regression check versus previous desktop layout. No collapse of columns.
- **Evidence**: Screenshot comparison.

### AC-17: Build & Type Check Pass
- **Type**: `rule`
- **Given**: Clean working tree after changes
- **When**: Running `npx tsc --noEmit` and `npx vite build`
- **Then**: Both commands succeed with 0 errors.
- **Pass Condition**: Exit code 0 for both; no TS errors printed.
- **Evidence**: Command outputs.

### AC-18: Overall Mobile UX Quality
- **Type**: `rubric`
- **Dimension**: Professional mobile grocery-app feel and visual match to reference pattern
- **Scale**: 1–5
- **Anchors**:
  - 1 = Feels like desktop squeezed to mobile. Spacing, proportions, section order clearly not matching the target pattern.
  - 3 = Acceptable layout, order correct, but still feels like a "website" not a "mobile app". Visual weight, density, micro-spaces clearly off versus reference quality.
  - 5 = Purpose-built mobile grocery app feel. Correct hierarchy order, correct densities, cards feel like native app, categories swipe smoothly, bottom nav comfortable, interactions snappy, safe areas clean. User would not confuse it for a desktop-responsive site.
- **Pass Threshold**: ≥ 4
- **Evidence**: Side-by-side annotated screenshot comparison with reference pattern checkpoints.

## Open Questions
- [ ] Reference video has not been viewable by the agent. User confirms "watch the entire video" is satisfied by user having watched it and the agent follows the 30-point written spec; is this correct? Assumption = YES (written spec is authoritative).
- [ ] Is there a dedicated `/offers` route already? Per audit: no — using `/shop#offers` anchor or query param is acceptable. Confirm with user on Approve.
- [ ] Is there a dedicated delivery-location selection flow (not admin dashboard) that "Change" button should link to? Audit shows `/profile` or `/contact` as candidates. Default = `/profile`.
