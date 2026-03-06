# PC Builder — 50 Features Reference

TheValueStore PC Builder implements **50 detailed functionalities** as follows.

## Compatibility & validation (1–12)
1. **Step-by-step wizard** — CPU → Motherboard → RAM → GPU → Storage → PSU → Case → Cooler.
2. **Socket compatibility** — CPU and motherboard must match socket (AM5, AM4, LGA1700).
3. **Form factor compatibility** — Case must support motherboard size (ATX, mATX, ITX).
4. **RAM type compatibility** — DDR4 vs DDR5 based on CPU/motherboard.
5. **RAM speed compatibility** — Only show RAM within CPU/MB max speed.
6. **GPU length vs case** — GPU length must fit case max length.
7. **Cooler height vs case** — Tower cooler height must fit case max cooler height.
8. **PSU wattage calculation** — Estimated total draw from TDP/watts of all parts.
9. **Recommended PSU wattage** — Total draw + 20% headroom; shown in sidebar.
10. **PSU form factor** — SFX required for SFF cases (e.g. NR200P).
11. **M.2 slot count** — Storage drives must not exceed motherboard M.2 slots.
12. **PCIe slot** — At least one slot for GPU (validated via compatibility).

## Warnings (13–15)
13. **Warning: no storage** — Alert if no storage selected.
14. **Warning: insufficient PSU** — If total draw &gt; PSU watts or below recommended.
15. **Warning: no CPU cooler** — Suggest cooler for high TDP CPUs (&gt;65W).

## Build management (16–21)
16. **Save build** — Name and save to store-features (savedBuilds).
17. **Load saved build** — List and load any saved build.
18. **Share build** — Generate shareable link (encoded part IDs); copy to clipboard.
19. **Clone build** — Duplicate current build with new name (opens save modal).
20. **Clear build** — Clear all parts with confirmation dialog.
21. **Build presets** — Load preset (Budget, Creator, SFF, etc.) from build guides to pre-fill.

## Pricing & offers (22–25)
22. **Running total + GST** — Subtotal, GST %, GST amount, total in sidebar.
23. **Apply promo code** — e.g. BUILD100, TVSPC500; reduces total.
24. **Bundle discount** — Full-build discount (e.g. ₹1000 when 6+ parts selected).
25. **Price comparison** — Subtotal vs after discount; total with GST.

## Performance & estimates (26–30)
26. **Estimated TDP/wattage** — Shown as “Est. draw” in sidebar.
27. **Recommended PSU** — “We recommend X W+” in sidebar.
28. **Estimated FPS** — 1080p, 1440p, 4K FPS from CPU+GPU bottleneck.
29. **Performance score** — 0–100 from CPU and GPU tier.
30. **Use-case badges** — e.g. “1080p Gaming”, “Creator”, “SFF”, “Value”.

## UI/UX (31–40)
31. **Category tabs** — Tabs for each component type (Processor, Motherboard, etc.).
32. **Filter by compatibility** — Only show compatible parts after CPU/MB/case selected.
33. **Sort parts** — By price low→high or high→low.
34. **Search within category** — Text search in current step.
35. **Compare part** — Compare selected part with one alternative (specs modal).
36. **Part tooltip / specs** — Key specs (TDP, socket, form factor, warranty) in list.
37. **Recommended for slot** — Compatible parts list is filtered per slot.
38. **Empty slot placeholder** — “+ Add CPU”, “+ Add GPU”, etc. when nothing selected.
39. **RAM quantity** — Single selection per slot (kit = 2 sticks); multi-slot via presets.
40. **Multiple storage** — Support multiple M.2 drives (validated against MB m2Slots).

## Data & catalog (41–42)
41. **Parts catalog** — Full pcParts catalog (CPU, MB, RAM, GPU, Storage, PSU, Case, Cooler).
42. **Compatibility matrix** — Green/red indicators per check in sidebar.

## Export & share (43–47)
43. **Export build as text** — Summary text for PDF/email/print.
44. **Print build** — Opens print dialog with build summary.
45. **Email build** — Mailto link with build summary.
46. **Expert review request** — “Expert review” button → expert booking with topic “Review my PC build”.
47. **Share link** — URL with `?build=<encoded>`; loading page with `?build=` restores build.

## Summary & delivery (48–50)
48. **Warranty summary** — Per-part warranty in sidebar.
49. **Estimated delivery** — “5–7 days” or “7–10 days” based on stock.
50. **Add build to cart** — Add all selected parts to cart in one click; disabled until all required slots filled.

---

## Files

- **`src/lib/pcBuilderUtils.js`** — Compatibility, wattage, FPS, performance score, warnings, share encode/decode.
- **`src/data/pcParts.js`** — Part catalog and categories.
- **`src/data/storeFeaturesDb.js`** — `savedBuilds` type for saving builds.
- **`src/app/api/buildpc/route.js`** — POST with `partIds` returns full summary (compatibility, wattage, FPS, etc.); GET returns presets.
- **`src/app/api/store-features/route.js`** — Supports `savedBuilds` type.
- **`src/components/store/PCBuilderView.jsx`** — Full UI implementing the 50 features.
- **`src/components/store/StoreView.jsx`** — Build PC tab renders `PCBuilderView`.

## Promo codes (example)

- **BUILD100** — ₹1000 off  
- **TVSPC500** — ₹500 off  

Bundle discount (₹1000) applies automatically when 6+ parts are selected.
