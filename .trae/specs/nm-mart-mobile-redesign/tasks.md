# NM MART Mobile Website Redesign — Implementation Plan
## Exact 30-Point User Prompt Mapping

---

## Task 1: Global Mobile CSS Foundation (index.css)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Covers User Prompt Points**: 3 (ticker), 13 (card proportion padding/gap), 22 (desktop preserved), 23 (responsive widths), 24 (performance), 27 (visual implementation — widths/grid/overflow/positioning)
- **Description**:
  - File: `src/index.css`
  - **Point 3 Support**: VERIFY existing `.announcement-ticker` + `.announcement-track` (marquee-scroll keyframes, 28s linear infinite, R→L seamless, thin ~34px). ENSURE ticker height stays compact.
  - **Point 13 Support**: Add mobile-first container padding utility for 12–16px page padding + 10–12px grid gap primitives (Tailwind classes). Confirm horizontal overflow is blocked globally: `html, body { overflow-x: hidden }` at base layer.
  - **Point 23/27 Support**:
    - Cross-browser no-scrollbar utility: `.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; } ::-webkit-scrollbar { display: none; }` for swipe carousels (categories, brands).
    - Safe-area padding variable for Bottom Navigation: `--nm-bottom-nav-h: 64px;` then `.pb-safe-nav { padding-bottom: calc(var(--nm-bottom-nav-h) + env(safe-area-inset-bottom) + 1.25rem); }` on mobile only (`@media (max-width: 767px)`).
    - Add `md:` exclusivity: all mobile spacing overrides are wrapped with proper `md:` / `@media (min-width: 768px)` reversals so desktop does NOT inherit cramped mobile proportions (Point 22).
  - **Point 24 Support**: NO new heavy keyframes/animations beyond what exists. Preserve lazy-loading & existing framer-motion defaults.
- **Acceptance Criteria Addressed**: AC-1 (ticker), AC-15 (no horizontal overflow), AC-16 (desktop), AC-5 (no scrollbar on swipe), AC-10 (bottom nav spacing)
- **Test Requirements**:
  - `rule` TR-1.1: At 320/360/390/430px → `document.documentElement.scrollWidth === clientWidth` (no x-overflow). Evidence: DevTools measurements per width.
  - `rule` TR-1.2: Ticker animation intact, 1-line, height ≤38px. Evidence: Screenshot.
  - `rule` TR-1.3: Hide-scrollbar utility suppresses bar on categories carousel (Chrome mobile sim). Evidence: Screenshot.
  - `rule` TR-1.4: Desktop 1280px still uses full existing container grid, no collapse to 2-col. Evidence: Screenshot comparison.
- **Notes**: Never remove existing `.gradient-brand`, `.nm-card`, `.announcement-ticker::before/after`.

---

## Task 2: Thin Update Ticker Final Check (App.tsx)
- **Status**: `pending`
- **Priority**: medium (verification-only task)
- **Depends On**: Task 1
- **Covers User Prompt Points**: 3 (EXACTLY — Point 3 is fully dedicated to announcement ticker)
- **Description**:
  - File: `src/App.tsx`
  - **Point 3 Enforcement**: Confirm `<AnnouncementTicker />` remains at very top (above Router routes). REMOVE any alternate `<SiteUpdateBanner />` if accidentally mounted.
  - Ticker content (already in `AnnouncementTicker.tsx`) matches the user's EXACT Point 3 spec:
    - 🚧 NM MART WEBSITE UPDATE IN PROGRESS
    - • हम आपको बेहतर Shopping Experience देने के लिए वेबसाइट को अपडेट कर रहे हैं
    - 📍 Naya Nagar, Dhata Road, Manjhanpur, Kaushambi
    - 🌐 NMmart.in
    - 📞 +91 8282827240
    - Seamless R→L loop, one line, compact height ~34px.
  - If any item is missing → edit AnnouncementTicker.tsx to match the EXACT Point 3 list.
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `rule` TR-2.1: All 5+ exact Point 3 ticker items present in tickerContent. Evidence: Source read + runtime visual.

---

## Task 3: Mobile Header Restructure (Navbar.tsx) — Compact + Full-Width Search Below
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1
- **Covers User Prompt Points**: 4 (EXACTLY Point 4), Point 13 (page padding), Point 22 (desktop preserved)
- **Description**:
  - File: `src/components/Navbar.tsx`
  - **Point 4 Structure**:
    - Row 1 (compact header):
      - Left: NM MART logo (circular). Mobile: h-10 w-10 logo container. Logo-only on mobile (the store-name text block is `hidden md:block` — keep this so mobile stays compact with logo only; desktop retains full name+slogan as per Point 22).
      - Right (3 actions, EXACT order from Point 4): Account → Cart → Menu.
    - Row 2 (DIRECTLY BELOW header, full-width, `md:hidden` as Point 4 requires mobile search below header):
      - Search bar with placeholder EXACTLY: "Search products, brands & categories".
      - Submit → navigate to `/shop?search=<encoded>`.
  - Keep existing Account dropdown (Profile/Orders/Track/Support/Login), Cart badge counter, mobile drawer (Menu opens drawer). Point 4 says "Use our existing functionality. Do NOT invent new functionality." — so preserve 100%.
  - Mobile header overall height tight: container `py-2 px-3` on mobile (not `py-3 px-4`), actions `min-h-10` buttons on mobile.
  - Desktop preservation (Point 22): `md:h-[78px] px-6`, search INLINE on desktop (md:flex flex-1 block).
- **Acceptance Criteria Addressed**: AC-2 (header + search), AC-16 (desktop preserved)
- **Test Requirements**:
  - `rule` TR-3.1: Mobile DOM visual order = [Logo (L) + Account/Cart/Menu (R)] → [Full-width search]. Placeholder string EXACT match. Evidence: 390px screenshot + placeholder exact match check.
  - `rule` TR-3.2: Account/Cart buttons still open EXACTLY what they did before (dropdown + navigate). No new invented actions. Evidence: Click 3 actions each → same behavior as baseline.
  - `rubric` TR-3.3: Dimension = Mobile header compactness. Scale 1-5. 1=still tall/desktop look, 3=OK, 5=purpose-built grocery-app compact header, logo+actions crisp, no wasted vertical. Threshold ≥4. Evidence: 390px shot.

---

## Task 4: Delivery / Location Row (Navbar.tsx — ADD new row)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 3
- **Covers User Prompt Points**: 5 (EXACTLY Point 5)
- **Description**:
  - File: `src/components/Navbar.tsx` — INSERT new compact location row AFTER full-width search row (i.e., below search, above the header boundary) on mobile only (`md:hidden`).
  - **Point 5 data rules (NO FAKE LOCATION)**:
    - Row structure: `📍 Deliver to → [REAL LOCATION STRING] → Change`
    - Location source PRIORITY (never Lucknow / never hardcode fake):
      1. **If user is logged-in & has profile address**: use `profiles.address + " " + profiles.city + " " + profiles.pincode` (query via `TABLES.profiles` select address/city/pincode where id=userId — lightweight try/catch, error → fall through).
      2. **Else if store has existing configured location (storeConfig pincodes array or STORE_DETAILS)**: use the store's real address from `STORE_DETAILS` constant: `"Naya Nagar, Dhata Road, Manjhanpur, Kaushambi"`.
      3. If all empty → omit row entirely.
    - "Change" micro-button → navigate to `/profile` for logged-in or `/contact` for guest (existing routes only, no invented flow).
  - Compact style: no thick background. Use `py-1.5 px-4`, small text `text-[11px]`, "Deliver to" muted; location string semibold; "Change" brand-orange semibold link-style.
- **Acceptance Criteria Addressed**: AC-3 (real location only), AC-15
- **Test Requirements**:
  - `rule` TR-4.1: No literal "Lucknow" or any other fake city hardcoded in Navbar.tsx. Location visible at runtime is either STORE_DETAILS address or user profile. Evidence: Grep `Lucknow` → 0 matches in src; runtime value check.
  - `rule` TR-4.2: Change button navigates to /profile or /contact (existing real route). Evidence: Click → URL changes correctly.
  - `rule` TR-4.3: Row only visible on mobile (<768px). Desktop shows no row. Evidence: 1024px screenshot.

---

## Task 5: Hero Banner Carousel (HeroBanner.tsx) — Mobile Aspect + Supabase Data Only
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1
- **Covers User Prompt Points**: 6 (EXACTLY Point 6), Point 25 (Supabase single source), Point 27 (layout)
- **Description**:
  - Files: `src/components/shop/HeroBanner.tsx` (and data fetch in HomePage is already via `fetchActiveBanners` — verify).
  - **Point 6 Rules**:
    - Only banners from Supabase `TABLES.banners` (via fetchActiveBanners) with `is_active=true`. Sorted by `sort_order`.
    - No fake banner text. No fake images. No invented promotions.
    - If 0 active banners → clean empty state ("No offers right now") or omit section.
    - Mobile aspect ratio: NOT excessively tall. Target `aspect-[16/7]` mobile (`w-390 → h-170` approx). Add `max-h-[220px]` clamp. Desktop aspect unchanged.
    - Click support: If banner has `link_url` → navigate there; else `/shop` default. No invented link destinations.
    - Carousel: 5s auto-rotate, dot indicators, touch-swipe friendly. Existing controls preserved.
  - **Point 25 Enforcement**: Inside HeroBanner.tsx, NO hardcoded banner arrays. All data via props `banners` array only.
- **Acceptance Criteria Addressed**: AC-4 (banner data + empty state), AC-12 (no fake data)
- **Test Requirements**:
  - `rule` TR-5.1: At 390px banner height ≤220px (not too tall). Evidence: Computed height measurement.
  - `rule` TR-5.2: No hardcoded `const banners = [...]` inside HeroBanner or HomePage (props only). Grep → 0 matches. Evidence: Source grep.
  - `rule` TR-5.3: If banners array empty → either section hidden OR dashed empty state chip rendered; never blank white box with no message. Evidence: Test by passing empty array, take screenshot.

---

## Task 6: Shop By Category Section (HomePage.tsx) — Circular 80-95px + Horizontal Swipe
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1 (hide-scrollbar), Task 5 (section order)
- **Covers User Prompt Points**: 7 (EXACTLY Point 7), Point 13, Point 25, Point 27
- **Description**:
  - File: `src/pages/HomePage.tsx`
  - **Point 7 Structure & Rules**:
    - Heading block:
      - Eyebrow: `SHOP BY CATEGORY` (uppercase, brand-orange, small tracking)
      - Main heading: `BROWSE CATEGORIES`
    - Category item spec EXACT Point 7:
      - Circular image: 80–95px diameter on 390px mobile (use `h-[88px] w-[88px] sm:h-[94px] sm:w-[94px]` — center of the range)
      - `object-fit: contain` (no crop), centered, `p-1.5` inside circle.
      - No square outer shell; no unnecessary white ring beyond padding.
      - Below circle: real category name (exact data), centered, readable 12-13px line-clamp-2.
    - Layout: Horizontal swipe carousel (overflow-x-auto + `.hide-scrollbar` class from Task 1). NO native scrollbar visible.
    - **Data Source (Point 7 + 25)**:
      1. First: `TABLES.categories` rows where `is_active=true` (already loaded via existing useEffect). Use `resolveStorageImageUrl(cat.image_url, "categories")` for category image.
      2. Image fallback per category: if no image_url, use first matching product image from `allProducts` by category name (already `productImageByCategory` map).
      3. If still no image: 2-letter uppercase abbreviation.
      4. Category names: ALWAYS real ones from DB. NEVER hardcoded list.
    - Click → navigate to `/shop?category=<encoded>` (existing route).
- **Acceptance Criteria Addressed**: AC-5 (sizing/data/swipe), AC-12, AC-15
- **Test Requirements**:
  - `rule` TR-6.1: Circle computed diameter 80–95px at 390px. Image object-contain. Name centered below, max 2 lines. Evidence: Screenshot measurement.
  - `rule` TR-6.2: Horizontal swipe works; no visible native scrollbar. Evidence: Side-by-side swipe screenshot (before/after) + no scrollbar visible.
  - `rule` TR-6.3: All rendered category names are present in categories table OR products.category_name Supabase data. No invented names. Evidence: Runtime name list cross-check against useProducts().categories.

---

## Task 7: Top Brands / Brands You Love Section (HomePage.tsx) — Real Data Only OR Hidden
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 6
- **Covers User Prompt Points**: 8 (EXACTLY Point 8), Point 25
- **Description**:
  - File: `src/pages/HomePage.tsx` — ADD AFTER Category section.
  - **Point 8 Rules**:
    - Only render if real brand data exists: `brands` from `useProducts()` (derived from unique `product.brand_name`) has length > 0. If empty → SKIP (hide section completely).
    - Heading: `BRANDS YOU LOVE` (eyebrow + title similar to categories).
    - Same circular pattern as categories (slightly smaller OK, ~72-80px circles on mobile).
    - **Only real brand logo/images**: If no dedicated brand logo table exists (confirmed — none), use product image fallback per brand: `productImageByBrand[brand]`.
    - If brand has no image → 2-letter abbreviation chip (clean fallback, no fake logo PNGs).
    - Brand name: real only. Click → `/shop?brand=<encoded>`.
    - No fake brands. No placeholder brand names like "Nike", "Coca-Cola" invented. Only actual names from DB.
- **Acceptance Criteria Addressed**: AC-6 (brands conditional + real), AC-12
- **Test Requirements**:
  - `rule` TR-7.1: If `brands.length === 0` → Brands section DOM node NOT rendered. Evidence: Render with empty brands array → no HTML node.
  - `rule` TR-7.2: All rendered brand names exist in useProducts().brands set. No invented names. No hardcoded `const brands = [...]` array. Evidence: Source grep + runtime value check.
  - `rule` TR-7.3: Missing image gracefully handled (abbreviation chip or image-alt fallback). No broken <img> with missing src. Evidence: Check for broken image icons.

---

## Task 8: Product Sections (HomePage.tsx) — Data-Conditional. No Fake Sections.
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 7
- **Covers User Prompt Points**: 9 (EXACTLY Point 9), Point 25
- **Description**:
  - File: `src/pages/HomePage.tsx`
  - **Point 9 Non-Negotiable**: "Only render a section if the underlying real Supabase data exists. Do not invent products."
  - **Overall section order (after brands)**:
    1. Featured Products (if `featuredProducts.length > 0`)
    2. Popular Products (if `popularProducts.length > 0` — in-stock items)
    3. Special Offers (discount > 0)
    4. Flat 50%+ (if `flat50.length > 0`)
    5. Flat 33–49% (if `flat33.length > 0`)
  - For each section: IF the data array is empty → OMIT the section (do not render title + empty grid).
  - For each section: Title pattern: eybrow uppercase brand-orange + title uppercase bold (similar to categories). "View all" → `/shop` with section-appropriate filter.
  - All product lists flow from `useProducts()` return value (`featuredProducts`, `flat50`, `flat33`, `allProducts`). NO second Supabase call in HomePage beyond the existing banner + categories-table image lookup.
  - **Point 25**: No static product arrays.
- **Acceptance Criteria Addressed**: AC-13 (section conditional), AC-12 (no fake data), AC-4 (banner), AC-6 (brands)
- **Test Requirements**:
  - `rule` TR-8.1: For a section where underlying array is empty (e.g. flat50 = []), the section wrapper DOM node is not present in rendered HTML. Evidence: DevTools inspector + empty array test scenario.
  - `rule` TR-8.2: Featured/Popular/Offers each display at LEAST the min number if data present (not capped too low). Evidence: Render on real data → count cards per section.

---

## Task 9: ProductCard Redesign (ProductCard.tsx) — Sizing, No Internal Codes, Add to Cart Proper
- **Status**: `pending`
- **Priority**: high (highest for customer experience)
- **Depends On**: None (independent component; HomePage uses it in Task 8)
- **Covers User Prompt Points**: 10, 11, 12, 13, 14, 15 (EXACTLY Points 10-15), Point 25
- **Description**:
  - File: `src/components/shop/ProductCard.tsx`
  - **Point 10 (Card Structure)**:
    - Top-left discount badge: ONLY if real `discountPercent > 0` (rounded % or exact).
    - Large product image area.
    - Stock status: "IN STOCK" (green) or "OUT OF STOCK" (if stock=0 overlay disabled).
    - Product Name (readable).
    - Size / Unit line (only if real unit non-empty).
    - Price area: Sale price prominent + MRP (if > sale) strike-through.
    - Full-width [ADD TO CART] button.
  - **Point 11 (REMOVE INTERNAL CODES — CRITICAL)**:
    - Existing `isInternalCodeValue = /^[\d]+$/` — ENFORCE strictly.
    - HELPER `shouldDisplayLabel(text: string): boolean`:
      - Returns FALSE if: pure numeric /^\d+$/, OR length <=2 AND pure numeric, OR blank/whitespace.
      - Use this BEFORE rendering unit/subCategory label line.
    - ENSURE: Between product name <h3> and price <div> — no purely numeric text nodes (no 72, 73, 1, 2 codes visible).
    - Database untouched — just customer-facing UI hide.
  - **Point 12 (Product Image)**:
    - Image area: FIXED height `h-[160px]` on mobile (not `h-[175px] sm:h-[195px] md:h-[210px]` which is too tall). `object-contain p-2`, NO distortion, preserve aspect ratio.
  - **Point 13 (2-col grid + card proportions)**:
    - Card outer: remove `min-h-[330px]` (too tall). Use `h-full` only. Let grid row natural alignment `auto-rows-fr`.
    - Grid gap handled in HomePage Task 10 (parent grid = gap-[10-12px]).
  - **Point 14 (Readable mobile typography)**:
    - Product name: `text-[13px] leading-snug font-semibold line-clamp-2`.
    - Sale price: `text-[17px] font-black leading-none` (NOT 1.45rem/23px — too big).
    - MRP strike-through: `text-[11px]`.
    - Stock badge: `text-[9px] uppercase tracking-wider`.
    - Save ₹ line: `text-[9px]` (keep if present).
  - **Point 15 (Add to Cart)**:
    - Button `min-h-[42px]`, `w-full`, fully inside card.
    - Text `text-[11px] uppercase tracking-widest`.
    - Existing `onAddToCart` logic (from useCart addToCart) preserved 100%.
    - Out-of-stock → button disabled + text "Out of Stock".
- **Acceptance Criteria Addressed**: AC-7 (no internal codes), AC-8 (proportions rubric), AC-9 (add to cart real logic)
- **Test Requirements**:
  - `rule` TR-9.1: Render a card where `subCategory="73"` and `unit="72"`. The sub-labels area shows NOTHING (or line fully hidden). No "72" or "73" visible text. Evidence: Screenshot + DOM text nodes inspection.
  - `rule` TR-9.2: Computed sizes at 390px: price=16-18px, name=12-14px, button height=40-44px, image height=158-162px, stock=9-10px, ATC text=11-12px. Evidence: Computed DevTools values.
  - `rule` TR-9.3: Button fully inside card (no negative margin, no clipped corners visually). Add to cart calls the existing `onAddToCart` prop — cart count header updates. Evidence: Click test + state check.
  - `rubric` TR-9.4: Dimension = Product card visual quality. Scale 1-5. 1=tiny image, huge price, no whitespace; 3=OK; 5=image large & clear, name readable, price strong, discount visible, button prominent & comfortable. Threshold ≥ 4. Evidence: 390px 2-column grid screenshot.

---

## Task 10: Product Grid (HomePage.tsx Parent) — 2-col, Padding, Gap
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 9 (card proportions known), Task 8
- **Covers User Prompt Points**: 13 (EXACTLY Point 13 grid), Point 23 (responsive widths), Point 27
- **Description**:
  - File: `src/pages/HomePage.tsx` — on every product section grid wrapper.
  - **Point 13 SPEC (390px viewport)**:
    - Page horizontal padding: `px-3` (~12px). Section shells `rounded-[14px] p-3` (inside page, so total is ~12-16).
    - Grid gap: `gap-[11px]` on mobile (exactly 10–12 range).
    - Columns: `grid-cols-2` (mobile), `md:grid-cols-4`, `lg:grid-cols-5`, `xl:grid-cols-6`.
    - Cards use almost all available width (no desktop `max-w-xs` restriction, no `md:` shrink).
    - Remove `min-h-[340px]` className override passed to `<ProductCard>` (Point 13: cards not unnaturally tall).
  - **Point 23 (All widths 320/360/375/390/414/430)**: Grid adapts (always 2-col mobile, no column width below ~140px). If 320px tightens too much, adjust inner image to `h-[150px]` or reduce button to `min-h-[40px]` — but keep 2-col.
- **Acceptance Criteria Addressed**: AC-8 (grid rubric), AC-15 (no overflow)
- **Test Requirements**:
  - `rule` TR-10.1: At 390px → page horiz padding 12-16px, grid gap 10-12px. 2-col layout, cards ~175px wide each approx. Evidence: DevTools box-model measurements.
  - `rule` TR-10.2: All mobile widths (320/360/375/390/414/430) → no horizontal overflow, no clipped cards. Evidence: Per-width screenshots.

---

## Task 11: Offers Section (HomePage.tsx) — Real Data Only
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 8 (sections framework), Task 9 (cards)
- **Covers User Prompt Points**: 16 (EXACTLY Point 16), Point 25
- **Description**:
  - File: `src/pages/HomePage.tsx` — Special Offers section (already in Task 8 as discount>0 products block).
  - **Point 16 Enhancement**:
    - If offers section has items → style it attractively (similar spirit to reference: a visually highlighted block, maybe subtle gradient section shell bg `from-orange-50 via-white to-amber-50`).
    - Only real product data (cards from ProductCard). No fake "Buy 1 Get 1" invented text.
    - If offers banners exist in banners table (banner_type=offer or similar), optionally show those above the product grid — but ONLY if real banner rows exist.
    - If 0 offers → hide section fully (already handled in Task 8 conditional).
- **Acceptance Criteria Addressed**: AC-13, AC-12
- **Test Requirements**:
  - `rule` TR-11.1: No hardcoded offer titles like "Flat ₹100 Off" or "Mega Sale" — only data-driven section headers. Evidence: Source grep of section JSX text content.

---

## Task 12: Category-Specific Shopping Hierarchy (HomePage / ShopPage Structure Note)
- **Status**: `pending`
- **Priority**: low
- **Depends On**: Task 6 (categories)
- **Covers User Prompt Points**: 17 (EXACTLY Point 17)
- **Description**:
  - Point 17: "Follow the video pattern where appropriate: Category → subcategories/products. Use actual NM Mart category hierarchy. Do not invent relationships."
  - Categories table currently has no parent_id (from schema — categories table has `id, name, image_url, description, is_active, is_deleted, sort_order`). No subcategory field in categories table.
  - Subcategories exist ONLY as `products.subcategory_name` / `products.sub_category_name` (product-level fields).
  - Action: On HomePage, clicking a category routes to `/shop?category=<name>` which uses ShopPage. Ensure that ShopPage already displays subcategory filters derived from product subcategory names — IF that mechanism exists, confirm it works and no changes needed.
  - NO invented subcategory tree. Subcategories = real derived from filtered product set only.
  - If no existing ShopPage subcategory filter display → that's OK because categories table has no parent/child relationship (can't invent one per Point 17).
  - This task is VERIFICATION-ONLY: read [ShopPage.tsx] and verify no hardcoded category->subcategory map exists; no-invention rule satisfied. Document verification result as completion evidence.
- **Acceptance Criteria Addressed**: AC-12
- **Test Requirements**:
  - `rule` TR-12.1: No hardcoded subcategory relationship map in HomePage or ShopPage source code. Subcategories are derived from product fields only. Evidence: Source grep `const subcategories = \[` + ShopPage read.

---

## Task 13: Shop By Store / Other Sections — Skip Unless Real Data
- **Status**: `pending`
- **Priority**: low (verification-only task)
- **Depends On**: Task 8
- **Covers User Prompt Points**: 18 (EXACTLY Point 18)
- **Description**:
  - Point 18: "If NM Mart has real store/category/service data corresponding to such sections, show it. Otherwise DO NOT create fake sections just to copy the video."
  - Audit: No "stores" table, no "service" table, no multi-store support confirmed in schema. Tables: products, orders, profiles, categories, banners only.
  - Action: NO "Shop by Store" / "Other" invented sections added to HomePage.
  - Verification: Confirm HomePage sections list (Task 8 order) only includes the data-backed sections; no placeholder section like "Stores Near You" or "Our Services" with empty or fake content.
- **Acceptance Criteria Addressed**: AC-12, AC-13
- **Test Requirements**:
  - `rule` TR-13.1: HomePage renders only sections backed by real data sources. No "Store / Services" wrapper present if no table exists. Evidence: Rendered section list audit.

---

## Task 14: Footer Real NM Mart Info (Footer.tsx)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1
- **Covers User Prompt Points**: 19 (EXACTLY Point 19), Point 25
- **Description**:
  - File: `src/components/shop/Footer.tsx`
  - **Point 19 EXACT real info to use**:
    - Brand: `NM MART`
    - Slogan: `SHOP MORE, SAVE MORE`
    - Address: `Naya Nagar, Dhata Road, Manjhanpur, Kaushambi` (or the full STORE_DETAILS version — already there in Footer.tsx)
    - Website: `NMmart.in`
    - Phone: `+91 8282827240`
  - Mobile polish:
    - Mobile collapses to single column (default grid). Reduce vertical padding `py-12 → py-8` on mobile. Inner blocks stacked tight.
    - All text/links are readable at mobile (no 9px tiny where not needed).
    - Address box rounded-2xl kept, works on mobile, text wraps, no horizontal overflow.
  - Desktop 4-col grid preserved at xl (Point 22).
  - Zero invented information. No fake social media links that don't go anywhere.
- **Acceptance Criteria Addressed**: AC-14 (real info), AC-15 (no overflow)
- **Test Requirements**:
  - `rule` TR-14.1: Footer text matches Point 19 strings exactly OR matches real STORE_DETAILS constants. No made-up text. Evidence: Text diff check.
  - `rule` TR-14.2: Footer at 390px is single-column, no x-overflow, all links tappable. Evidence: Screenshot.

---

## Task 15: Bottom Navigation (Mobile Only, Real Routes Only)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1 (safe-area padding), Task 14
- **Covers User Prompt Points**: 20 (EXACTLY Point 20), Point 22, Point 23, Point 27
- **Description**:
  - **New file**: `src/components/shop/BottomNavigation.tsx`
  - **Integrate into**: `src/App.tsx` — place inside Router, after `<Routes>` block, after `<Suspense>` wrapper closes so it renders on ALL customer pages.
  - **Point 20 Rules (STRICT)**:
    - Each item MUST connect to a REAL existing route/function. NO dead buttons.
    - Menu items to include (pick 5, verify every route exists):
      1. **Home** → `/` (exists) — Home icon (lucide)
      2. **Categories** → `/shop` (exists) OR scroll to `#categories` anchor on homepage. Use LayoutGrid icon.
      3. **Offers** → `/shop#offers` anchor (no new route needed, Point 20 says "if equivalent functionality already exists" — anchor is fine) OR `/shop?offers=true` if ShopPage supports the filter. Use Tag / Percent icon.
      4. **Orders** → `/orders` (definitely exists). Use Package icon.
      5. **More** → `/profile` (exists). Use Menu / MoreHorizontal icon.
    - **If any route does NOT exist for an item → REMOVE that item rather than inventing** (already all 5 routes confirmed from router).
    - Mobile-only: Hidden on ≥768px. (`md:hidden`, or `@media (max-width: 767px)` display block).
    - Fixed bottom, full width. Safe-area aware: `padding-bottom: env(safe-area-inset-bottom)`. Height ~64px (matches `--nm-bottom-nav-h` CSS var from Task 1).
    - Comfortable touch targets: each icon + label cell ≥48px tall. Active state (current route) uses brand-orange color text/icon.
  - **CRITICAL (to avoid content coverage)**:
    - In App.tsx wrap Routes output in `<div className="pb-safe-nav md:pb-0">` so every page's content has the safe padding on mobile. This satisfies "does not cover content" rule.
- **Acceptance Criteria Addressed**: AC-10 (bottom nav real routes, mobile only, safe area, no coverage), AC-16 (desktop hidden), AC-15
- **Test Requirements**:
  - `rule` TR-15.1: Click every nav icon → correct page loads (Home=/; Categories=/shop; Offers=/shop#offers or similar; Orders=/orders; More=/profile). No 404. Evidence: Click-by-click URL log.
  - `rule` TR-15.2: At 390px, bottom nav does NOT cover the last product's Add to Cart button or footer copyright line. Page content scrolls fully into view above nav. Evidence: Screenshot scrolled to very bottom.
  - `rule` TR-15.3: Desktop 1024px → bottom nav element has display:none. Evidence: Screenshot + computed display.

---

## Task 16: WhatsApp Floating Button Reposition
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 15 (bottom nav exists, spacing known)
- **Covers User Prompt Points**: 21 (EXACTLY Point 21), Point 23, Point 27
- **Description**:
  - File: `src/components/shop/WhatsAppButton.tsx`
  - **Point 21 Rules (STRICT overlap prevention)**:
    - On mobile (≤767px): Position the floating button CLEARLY ABOVE Bottom Navigation bar, with safe spacing.
      - Current: `bottom-[calc(1.1rem+env(safe-area-inset-bottom))]` → this is INSIDE bottom nav now; CHANGE to: `bottom-[calc(64px+1.25rem+env(safe-area-inset-bottom))]` (nav 64px + 20px gap).
      - Right side: keep `right-3`.
    - On desktop (≥768px, no bottom nav): Restore sensible lower-right position: `md:bottom-6 md:right-6`.
    - **Overlap tests (visual)**:
      - Must NOT cover: bottom product Add To Cart button, product image, bottom navigation icons, prices, footer links.
    - Keep existing: real `WA_NUMBER` ("918282827240"), WhatsApp link opens new tab, green circle styling, shadow.
- **Acceptance Criteria Addressed**: AC-11 (no overlap)
- **Test Requirements**:
  - `rule` TR-16.1: Screenshot 390px with both bottom nav + WA visible → bounding box of WA does not intersect with: (a) any Add to Cart button in last row, (b) any bottom nav icon/label. Evidence: Annotated screenshot with rectangles.
  - `rule` TR-16.2: Desktop WA still works and positioned normally. Evidence: 1024px screenshot.

---

## Task 17: Desktop Preservation + Responsive Widths Comprehensive Check Prep
- **Status**: `pending`
- **Priority**: high (verification + minor-fix task during QA)
- **Depends On**: All tasks 1–16 completed (runnable app)
- **Covers User Prompt Points**: 22, 23 (EXACTLY), 27
- **Description**:
  - Points 22/23/27 cover full responsive testing. This task is ACTIONS PERFORMED WHILE Task 18 runs; however it's called out separately because fixes for any regressions found here occur here.
  - Action list when issues arise:
    - **Point 22 (desktop)**: If ≥768px the header search becomes NOT inline (regressed by Task 3) → fix via explicit `md:flex flex-1 block` on desktop search wrapper. If product grid collapses to 2-col on desktop → restore `md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6`. If footer no longer 4-col on xl → restore.
    - **Point 23 (widths 320/360/375/390/414/430/768/desktop)**: For each width, open homepage and verify:
      - ✅ No horizontal page overflow (scrollWidth===clientWidth)
      - ✅ No clipped images
      - ✅ No clipped text
      - ✅ No overlapping buttons
      - ✅ No unnecessary empty space
      - ✅ Categories swipe correctly
      - ✅ Product grid works correctly (2-col mobile)
      - ✅ Header remains compact
      - ✅ Bottom nav does not cover content
      - ✅ WA does not cover content
    - Document every check result; fix only those that fail.
- **Acceptance Criteria Addressed**: AC-15, AC-16, AC-18 (rubric portion)
- **Test Requirements**:
  - `rule` TR-17.1: Full checklist above passes for all 8 widths. Evidence: Per-width test pass log.

---

## Task 18: Final QA + Data Integrity Audit + Build Verify
- **Status**: `pending`
- **Priority**: highest
- **Depends On**: All tasks 1–17 completed
- **Covers User Prompt Points**: 1 (audit data), 24 (performance), 25 (Supabase SSoT — ABSOLUTE), 26 (code reuse), 27 (visual), 28 (hierarchy), 29 (user journey), 30 (FINAL ACCEPTANCE CRITERIA)
- **Description**:
  - **Point 25 FINAL ENFORCEMENT**:
    - Full `src` grep (exclude node_modules, exclude `/src/data/products.ts` legacy file):
      - Pattern `const products = \[\s*\{` (object literal product array)
      - Pattern `const categories = \[\s*("|\{)` (hardcoded category list)
      - Pattern `const brands = \[\s*"` (hardcoded brand list)
      - Pattern `"Lucknow"` or fake city literal
      - Pattern `\.from\("products"\)` / `\.from\('products'\)` (should be 0; all via TABLES constant)
    - If any match found in active code → REMOVE. Note: `src/data/products.ts` pre-existing file — verify NOT imported.
  - **Point 26 (reuse existing architecture)**:
    - Verify: useProducts() still the single catalog hook. No duplicate Supabase calls in HomePage beyond categories-table image + banners.
    - Verify: TABLES constant used for all `.from()` calls. No hardcoded strings.
  - **Point 28 (Final Visual Hierarchy Confirmation)**:
    - Mobile homepage: Ticker → Header → Search → Delivery → Banner → Categories → Brands → (Featured) → Popular → Offers → (Flat50) → (Flat33) → Footer → (fixed Bottom Nav)
    - Document order with screenshot montage.
  - **Point 29 (User journey QA)**: Actually test in browser:
    1. Open homepage → 2. See ticker → 3. Header → 4. Search (type a term, submit → lands on /shop?search=) → 5. Banner (swipe prev/next or auto-rotate) → 6. Categories (swipe, tap one → /shop?category=) → 7. Brands → 8. Products visible → 9. Add one to cart (cart counter goes up + cart opens with item) → 10. Scroll through all sections → 11. Bottom nav each button works → 12. WA button clicks → opens wa.me correct number.
  - **Point 30 FINAL ACCEPTANCE**: verify all 30 sub-bullets in the user's "Final Acceptance Criteria" checklist. Pass any you can evidence; mark the ones covered by rubrics.
  - **Build & Type**:
    - Run `npx tsc --noEmit` → fix any errors.
    - Run `npx vite build` via node binary if npx blocked → success.
- **Acceptance Criteria Addressed**: AC-17 (build pass), AC-12 (no fake data), AC-1 (ticker present at top), AC-18 rubric final
- **Test Requirements**:
  - `rule` TR-18.1: `tsc --noEmit` exit 0, 0 errors. Evidence: Command output paste.
  - `rule` TR-18.2: Vite production build: BUILD SUCCESSFUL. Evidence: Command output paste.
  - `rule` TR-18.3: Grep for `const products/categories/brands = \[.*object|string literals` → 0 matches in active code. `Lucknow` → 0 matches in src. `.from("products"` etc → 0. All via `TABLES.*`. Evidence: Grep output paste.
  - `rule` TR-18.4: User journey steps 1–12 from Point 29 all succeed with real Supabase data, no console errors, no 404. Evidence: Journey step-by-step screenshot log.
  - `rubric` TR-18.5: AC-18 Dimension = Overall professional grocery mobile app feel vs reference pattern. Scale 1-5 (see spec AC-18 anchors). Threshold ≥ 4. Evidence: Annotated comparison screenshots per section of hierarchy.
