# TheValueStore branding — change log

This project is **TheValueStore** (gaming PCs, laptops & tech). Summary of changes and reference for future updates.

---

## Central config (single source of truth)

- **`src/lib/brand.js`**
  - `name`: `'TheValueStore'`
  - `tagline`: `'Best Value. Maximum Performance.'`
  - Use `brand.name` and `brand.tagline` in components instead of hardcoding.

---

## Already updated (first pass)

| File | Change |
|------|--------|
| `src/lib/brand.js` | name, tagline, comment |
| `src/app/globals.css` | Comment: TheValueStore |
| `src/components/layout/TopBar.jsx` | Logo TVS, title/tagline from `brand` |
| `src/components/store/StoreView.jsx` | Hero, referral text, franchise block, chatbot header/welcome, refCode TVS, locations text |
| `src/components/admin/Dashboard.jsx` | Fallback store name `brand.name` |

---

## Updated in this pass (retrieve & update)

- **Components:** FranchiseForm (contact email, “Own a”, “Why”), ChatbotWidget (BOT_RESPONSES, welcome msg, header TVS), CommHub (test message); Admin: EventLog (ST002 label), SEOManager (canonical domain), Franchise (name strip), CMSManager (new post author); Auth: AdminLoginModal (placeholder).
- **Data:** seoDb (pages, schemas, robots), stores (ST002 name/brand), whatsapp (templates), whatsAppTemplates (VT13), partners (SendGrid, Mailgun, Resend, Brevo, Pepipost), cmsDb (about, story, footer social/contact, blog seoTitle/author), offers (shareText), llmPromptLibrary (LP06).
- **Lib:** kynetra.js (import brand, franchise/menu replies), AppContext (sample chat message).

---

## Not changed (by design)

- **Auth credentials** (`src/lib/auth/credentials.js`, `AdminLoginModal` demo logins): use `*@thevaluestore.com` for demo logins (e.g. admin@thevaluestore.com / Admin@123).
- **Event log / audit data** (`src/data/eventLog.js`): actor emails use `*@thevaluestore.com` for consistency.

---

## SEO / canonical

- **Layout** (`src/app/layout.jsx`): metadata already uses TheValueStore and thevaluestore.com.
- **Data** `seoDb.js`: titles, descriptions, canonical URLs and schema names updated to TheValueStore / thevaluestore.com.

---

## Adding new copy

- Prefer `brand.name` and `brand.tagline` from `@/lib/brand` in UI.
- For emails/domains use `thevaluestore.com` (or your live domain).
- Demo logins use `*@thevaluestore.com` unless you add new demo users.
