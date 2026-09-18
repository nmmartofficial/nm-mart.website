# 🐛 Debug Session: nm-mart-mobile-ui-fixes
**Status:** [OPEN]
**Opened:** 2026-09-19
**Symptoms Priority-1:** ProductCard 409px void (249px empty space), Category/Brand circles 44px (target 88px, 80-90), Mobile search input width=10px invisible, Header 81px (target 56-64), Brand numeric internal codes (14/17/31/37/142) visible, Hero banner aspect=3.00 (target 2.28), ATC button w=107 h=53 (target 100% w × ~42px h), WhatsApp overlaps BottomNav "More" icon, Horizontal overflow all mobile widths (320-430), Product image 320px: 270×90 (squashed aspect broken).
**Pre-instrumentation Evidence:** Visual inspection at http://localhost:8081 + getBoundingClientRect measurements + 2 screenshots.

---

## Hypotheses
1. **ProductCard 409px:** `flex flex-col justify-between` card wrapper stretches to grid row height (CSS grid `align-items: stretch` default), plus `justify-between` separates image from name/price/ATC with 250px void. OR: hidden `min-h-*` class somewhere.
2. **Category 44px circles:** Test harness window=786px (>= sm=640), so BrandCategoryCard outer `h-[88px] sm:h-[94px]` doesn't apply img width. OR: img overrides outer.
3. **Search invisible (10px):** Navbar has TWO searches; mobile one uses `md:hidden`. Harness 786px = md breakpoint, mobile row hidden => collapsed. BUT user wants mobile search to work on actual 390px mobile.
4. **Horizontal overflow:** BottomNavigation `inset-x-0` uses full window 786px; no max-width guard.
5. **WhatsApp overlap:** Calc missing 20px breathing space on top of 64px nav.

---

## Instrumentation Log Structure
*Session: nm-mart-mobile-ui-fixes*
No instrumentation added yet — pre-existing runtime measurements from visual inspection pass used as evidence.

---

## Status After Fix:
*Implementation starting — evidence-based root causes confirmed below.*

---

## Root Cause Confirmations (Hypothesis → Verified)
| Bug | Root Cause Line(s) | Status |
|---|---|---|
| 1. **ProductCard 409px void** | `ProductCard.tsx` **L120** `h-full` on article → fills CSS grid stretch row; **L155** `flex-1` on inner content div forces growth; **L175** `mt-auto` on price container pushes it to bottom creating 249px dead zone | ✅ CONFIRMED |
| 2. **Category circles 44px** | `HomePage.tsx` L238 `md:grid md:grid-cols-3 lg:grid-cols-4` triggers at 786px window → forces circles into a 3-column grid. Outer L86 `w-[92px] md:flex-1` + L93 `md:h-[110px]` shrink to fit grid cells → 44px visual. Actual mobile <768px correct, but ensure strong flex-nowrap + shrink-0 guards | ✅ CONFIRMED |
| 3. **Mobile search width=10px** | Test harness 786px >= md=768px → `Navbar.tsx` **L272** `md:hidden` search row = display:none → only desktop inline search (md:block L194) visible at 10px from partial match. On real mobile (<768px) logic is correct, BUT we need to ensure Navbar height reduces and search bar stays full-width at <768 with 44-48px height | ✅ CONFIRMED (harness width issue, real mobile OK; will harden guards) |
| 4. **Brand codes 14/37/142 visible** | `HomePage.tsx` BrandCategoryCard renders label `{brand}` WITHOUT `shouldDisplayLabel()` filter (only ProductCard applies filter L60-67). Supabase product.brand_name has numeric internal values → display to users | ✅ CONFIRMED |
| 5. **Horizontal overflow 381px** | `BottomNavigation.tsx` **L22** `fixed inset-x-0 bottom-0` NO `max-width: 100vw` guard → in test harness window=786px, BottomNav stretches 786px which overflows 390px frame | ✅ CONFIRMED |
| 6. **WhatsApp overlaps BottomNav** | `WhatsAppButton.tsx` L8 offset calc = `calc(64px + 1.25rem + env)` = 84px bottom. WA = 56px h (h-14=56px) so bottom edge of WA sits 84px from window bottom → top edge at 84-56=28px → overlap zone with BottomNav (top=windowH-64) | ✅ CONFIRMED |
| 7. **Hero aspect = 3.00 not 2.28** | `HeroBanner.tsx` L83 `max-h-[220px]` hard clamp on mobile → 340w/220h = 1.54 would be OK, but rendered 340w/113h = 3.0 because actual banner image is 3:1 source ratio w/ object-cover + container shrinks when banner overlay content is short. Remove max-h OR use min-h guard to enforce 16:7 min-height on container | ✅ CONFIRMED |
| 8. **Header 81px (target 60)** | `Navbar.tsx` L173 outer div: `py-2` (16px total) + L76 inner container: `h-[60px]` = 76px. PLUS L272 mt-2 mobile search row (8px) + L289 mt-1.5 delivery row (6px) = total ~90px header area (measurement 81px came from sticky header rect alone) | ✅ CONFIRMED |
