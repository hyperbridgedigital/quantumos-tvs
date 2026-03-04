# TheValueStore × QuantumOS — Strategic Features Document

> **Platform:** TheValueStore (Gaming PCs, Laptops & Tech)  
> **Stack:** HyperBridge QuantumOS · Kynetra · TheReelFactory  
> **Version:** 11.4.0  
> **Last updated:** 2026-03-04

---

## 1. Homepage — 50 E‑commerce Features (Best-in-Class)

| # | Feature | Description | Configurable |
|---|---------|-------------|--------------|
| 1 | Hero carousel | Full-width hero with configurable slides, CTA, and auto-rotate | Admin: Landing |
| 2 | Global search | Instant search with suggestions, categories, and recent searches | Admin: Search |
| 3 | Mega menu | Category dropdown with featured products and links | Admin: CMS / Menu |
| 4 | Category grid | Top-level categories with icons and product counts | Admin: Catalog |
| 5 | Deal of the day | Single prominent deal with countdown | Admin: Promo |
| 6 | Flash sales strip | Horizontal scroll of time-bound offers | Admin: Promo |
| 7 | Recommended for you | Personalized picks (browser/segment-based) | Admin: AI / Catalog |
| 8 | Recently viewed | Client-side recently viewed products | CSR |
| 9 | Trending / Best sellers | Top products by views or sales | Admin: Catalog |
| 10 | New arrivals | Latest products with “New” badge | Admin: Catalog |
| 11 | Cart preview | Mini cart drawer/summary without leaving page | CSR |
| 12 | Wishlist | Save items; sync across sessions (localStorage or account) | CSR + Admin |
| 13 | Language switcher | Top 10 Indian + 10 international languages | Admin: i18n |
| 14 | Currency switcher | INR, USD, EUR, GBP, etc. with auto-detect | Admin: Settings |
| 15 | Location auto-detect | Geo + nearest store / delivery zone | Admin: Settings |
| 16 | Trust badges | Secure pay, free delivery, warranty, returns | Admin: Landing |
| 17 | Footer mega | Multiple columns: Help, Company, Legal, Social | Admin: CMS |
| 18 | Newsletter signup | Email capture with consent | Admin: Marketing |
| 19 | Social proof | “X bought in last 24h” or ratings summary | Admin: Catalog |
| 20 | Quick view | Modal product preview without full page load | CSR |
| 21 | Compare products | Add to compare bar; side-by-side specs | CSR |
| 22 | Breadcrumbs | Category > Subcategory > Product | CSR |
| 23 | Filters & sort | Price, brand, rating, availability, sort order | CSR |
| 24 | Infinite scroll / Load more | Catalog pagination | CSR |
| 25 | Product cards | Image, name, price, rating, quick actions | Admin: Catalog |
| 26 | Promo banners | Configurable banners between sections | Admin: CMS |
| 27 | Video hero | Optional video in hero (URL configurable) | Admin: Landing |
| 28 | Sticky header | Header stays on scroll with mini cart | CSR |
| 29 | Mobile bottom nav | Shop, Categories, Build PC, Cart, Account | Admin: Menu |
| 30 | Pincode / delivery check | Enter pincode for delivery and availability | Admin: Delivery |
| 31 | Notify when back in stock | Per-product signup | Admin: Catalog |
| 32 | Size / variant selector | On card or quick view | Admin: Catalog |
| 33 | Reviews snippet | Star rating + count on card | Admin: Catalog |
| 34 | Delivery estimate | “Get it by X” on product/cart | Admin: Delivery |
| 35 | Payment icons | Cards, UPI, BNPL, etc. | Admin: Landing |
| 36 | Return / warranty | Short policy line or link | Admin: CMS |
| 37 | Live chat entry | Kynetra widget entry point | Admin: Kynetra |
| 38 | Accessibility | Skip link, ARIA, keyboard nav | Code |
| 39 | SEO meta | Title, description, OG per page | Admin: SEO |
| 40 | Structured data | Product/Organization schema | Admin: SEO |
| 41 | Dark/Light theme | Optional theme toggle | Admin: Settings |
| 42 | App banner | “Install app” or PWA prompt | Admin: Settings |
| 43 | Exit intent | Optional popover (configurable) | Admin: Marketing |
| 44 | Announcement bar | Top strip (shipping, promo) | Admin: CMS |
| 45 | Store locator link | Find nearest store | Admin: Stores |
| 46 | Build PC CTA | Prominent link to configurator | Admin: Landing |
| 47 | Franchise / B2B CTA | Link for partners | Admin: Landing |
| 48 | Blog / Help link | Link to resources | Admin: CMS |
| 49 | Country/region selector | For international | Admin: i18n |
| 50 | Performance | Lazy load, optimized images, CSR where needed | Code |

---

## 2. Kynetra Frontend — Sales, Pre-sales, Post-sales, Build PC, CSR

| Module | Purpose | Features | Seed Data |
|--------|---------|----------|-----------|
| **Sales** | Orders, menu, offers, franchise | Quick replies: Menu, Deals, Franchise; product suggestions; cart help | 100 conversations |
| **Pre-sales** | Product advice, configurator, compatibility | “Build a PC”, “Which laptop?”, “Compare”; link to Build PC | 100 conversations |
| **Post-sales** | Tracking, returns, complaints, feedback | Track order, refund, reorder, review | 100 conversations |
| **Build PC** | Configurator handoff | “I want to build a PC” → open Build PC tab + preset | 100 conversations |
| **CSR** | General help, escalation, tickets | FAQs, live handoff, ticket creation | 100 tickets/conversations |

All modules configurable from Admin: Kynetra (enable/disable, quick replies, prompts).

---

## 3. Build a PC (CSR Module)

- 50-feature configurator (compatibility, bottleneck, thermal, presets, export, share, etc.).
- Full list in previous implementation; all client-side; shareable links.

---

## 4. Auto-Detect & Localisation

| Feature | Implementation | Admin |
|---------|----------------|--------|
| **Location** | Browser geolocation + optional IP fallback; nearest store / delivery zone | Settings: Delivery, Stores |
| **Currency** | Browser locale + manual override; persist in localStorage | Settings: Currency, i18n |
| **Language** | 10 Indian: Hindi, Bengali, Telugu, Marathi, Tamil, Gujarati, Kannada, Malayalam, Urdu, English | Settings: i18n |
| **International** | 10: Spanish, French, German, Portuguese, Arabic, Chinese (Simplified), Japanese, Russian, Korean, Italian | Settings: i18n |

---

## 5. Catalog — 500 Demo Products

- **Scope:** Up to 500 products with high-resolution placeholder images.
- **Categories:** Gaming PCs, Laptops, Components (CPU, GPU, RAM, etc.), Peripherals, Accessories, Software.
- **Fields:** id, name, price, category, image (URL), brand, rating, stock, sku, tags.
- **Images:** Configurable base URL (e.g. CDN or placeholder service); good resolution (e.g. 800×800).
- **Admin:** Catalog visibility, default sort, featured, new/trending flags.

---

## 6. Seed Data — 100 per Entity

- **Offers / Promos:** 100 seed promos (codes, tiers, dates).
- **Stores:** 100 seed stores (name, address, lat/lng, status).
- **Reviews:** 100 seed reviews (product, rating, text, user).
- **Orders:** 100 seed orders (status, items, customer).
- **Kynetra:** 100 seed conversations/tickets (Sales, Pre-sales, Post-sales, Build PC, CSR).
- **Customers:** 100 seed customers (name, phone, tier, LTV).
- **Products:** 500 in catalog (counts toward “catalogue within 500 demo products”).
- **Landing sections:** 100 seed section configs (hero, banners, CTAs) for admin pick.

(Where “100” is not needed for a small entity, use “up to 100” or a smaller round number and document in admin.)

---

## 7. Brand Landing Page (Configurable)

- **Hero:** Headline, subhead, primary CTA, secondary CTA, background image/colour, video URL.
- **Sections:** Reorderable blocks: Features, Testimonials, Categories, Promo strip, Video, Logos, FAQ.
- **Footer:** Columns, links, social, newsletter.
- **All content and visibility configurable from Admin: Landing.**

---

## 8. Admin Configuration Summary

| Area | What’s configurable |
|------|---------------------|
| **Landing** | Hero, sections, announcement bar, trust badges, CTAs, footer. |
| **i18n** | Default language, enabled languages (Indian + International), region/country list. |
| **Currency** | Default currency, auto-detect on/off, supported currencies. |
| **Location** | Auto-detect on/off, default store, delivery zones. |
| **Catalog** | Products (500), categories, featured/new/trending, image base URL. |
| **Kynetra** | Enable/disable Sales, Pre-sales, Post-sales, Build PC, CSR; quick replies; prompts. |
| **Build PC** | Enable/disable module, default presets, link in nav. |
| **Search** | Suggestions, categories in search, recent searches. |

---

## 9. Technical Notes

- **CSR modules:** Homepage sections, Build PC, Kynetra, cart preview, recently viewed, language/currency switcher run client-side where required.
- **SSR:** Landing meta, initial HTML, and static content can remain server-rendered; dynamic blocks hydrated on client.
- **Images:** Use next/image or equivalent; support configurable base URL for 500-product catalog.
- **Strategic doc:** This file (`docs/STRATEGIC-FEATURES.md`) is the single reference for all features; keep it updated when adding/removing capabilities.

---

*Powered by TheReelFactory & HyperBridge · QuantumOS*
