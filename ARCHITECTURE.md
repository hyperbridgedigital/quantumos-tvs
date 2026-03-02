# Charminar Mehfil — System Architecture Document

**Version: 1.0.1 | Platform: v10.4.0-enterprise**
**Prepared by: HyperBridge Group — Digital Architecture Division**

---

## 1. Executive Summary

Charminar Mehfil is an enterprise-grade food commerce platform designed as a monolithic Next.js application with a modular admin architecture. The system follows a single-page application pattern where a centralized React Context manages global state, and 18 lazy-loaded admin modules provide domain-specific management interfaces. The customer storefront and admin dashboard coexist within the same application, sharing data through the unified context layer.

The architecture prioritizes rapid iteration, zero-config deployment via Vercel, and progressive enhancement toward a fully microservices-ready backend. All 158 API integrations are configured through the admin UI without code changes, making the platform operationally self-service.

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                            │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  Storefront   │    │   Admin UI   │    │  Auth Layer  │  │
│  │  (StoreView)  │    │ (18 Modules) │    │  (OTP/RBAC)  │  │
│  │  5-tab nav    │    │  Lazy-loaded │    │  4 roles     │  │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘  │
│         │                   │                    │          │
│  ┌──────┴───────────────────┴────────────────────┴───────┐  │
│  │              AppContext (Global State)                  │  │
│  │  463 lines · React Context + useState                  │  │
│  │  State: stores, orders, cart, customers, settings...   │  │
│  └──────────────────────┬────────────────────────────────┘  │
│                         │                                    │
├─────────────────────────┼────────────────────────────────────┤
│                   API LAYER                                  │
│                                                              │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌──────┐ ┌──────────┐   │
│  │ Orders │ │WhatsApp│ │GraphQL │ │Health│ │  AI x2   │   │
│  │ REST   │ │Webhook │ │Flexible│ │Check │ │Anomalies │   │
│  └────────┘ └────────┘ └────────┘ └──────┘ │Recommend │   │
│                                             └──────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          Security Middleware (Rate Limit, CSRF)       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                   DATA LAYER                                 │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  13 Data Modules (src/data/)                           │  │
│  │  stores.js · orders.js · partners.js · products.js     │  │
│  │  offers.js · whatsapp.js · pincodes.js · crm.js        │  │
│  │  delivery.js · franchise.js · settings.js · roles.js   │  │
│  │  stock.js · moods.js                                   │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL Schema (schema/)                           │  │
│  │  enterprise-v10.sql · schema-v10.sql                   │  │
│  │  Production-ready DDL for Supabase/Neon/RDS            │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                EXTERNAL SERVICES (158 API Keys)              │
│                                                              │
│  WhatsApp(9) · SMS(12) · Email(10) · Payment(4)             │
│  Delivery(12) · Analytics(3)                                 │
│  Total: 47 provider sections, 158 API key fields             │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Application Layer Architecture

### 3.1 Entry Point and Routing

The application uses a single-page architecture with view-based routing managed through React state rather than Next.js file-based routing. The main entry point (`src/app/page.jsx`, 117 lines) controls two primary views:

**Store View** (`view === 'store'`): Renders the customer-facing storefront component with full product catalog, cart, offers, rewards, order tracking, and franchise inquiry capabilities.

**Admin View** (`view === 'admin'`): Requires authentication. Renders the admin sidebar navigation and dynamically loads one of 18 admin modules based on the selected tab. All admin modules are lazy-loaded using React.lazy() to optimize initial bundle size.

```
page.jsx (Router)
├── view === 'store'
│   └── StoreView.jsx (502 lines)
│       └── FranchiseForm.jsx (145 lines, lazy)
├── view === 'admin' && authenticated
│   ├── TopBar.jsx
│   ├── AdminSidebar.jsx
│   └── [ActiveModule].jsx (18 modules, all lazy)
└── view === 'admin' && !authenticated
    └── AdminLoginModal.jsx
```

### 3.2 State Management

All application state is centralized in `AppContext.jsx` (463 lines), which provides:

**Entity State** (useState for each domain):
- stores (18 entries), orders, stock, products
- customers, franchises, deliveryPartners, deliveryZones
- waTemplates, viralCampaigns, offers
- cart, settings, partnerValues, roles, userLocation

**Derived State** (useMemo/computed):
- activeStores: Filters stores by status === 'active'
- currentStore: Selected store object
- storeZones: Delivery zones for selected store
- availableProducts: Stock-aware product list
- liveOrders: Non-delivered orders
- customerOrders: Orders matching logged-in customer
- lowStock: Items below reorder threshold
- cartTotal: Sum of cart items

**Actions** (functions exposed via context):
- CRUD operations for all entities (add, update, delete)
- placeOrder: Creates order, updates customer LTV, adjusts stock
- addToCart/removeFromCart/updateCartQty: Cart management
- login/logout: Admin authentication with role assignment
- userSendOTP/userVerifyOTP: Customer multi-channel OTP
- updateSetting/saveSettings: Global configuration management
- updatePartnerConfig/savePartnerConfig: API key management

### 3.3 Component Architecture

Components follow a strict organizational hierarchy:

```
components/
├── admin/          # 18 domain-specific admin modules
│   ├── Dashboard.jsx       (48 lines)   — KPI cards + hourly chart
│   ├── OMS.jsx             (68 lines)   — Order management pipeline
│   ├── StoreLocator.jsx    (103 lines)  — Multi-store management
│   ├── DeliveryEngine.jsx  (84 lines)   — Zone + partner management
│   ├── StockWMS.jsx        (70 lines)   — Inventory + alerts
│   ├── POS.jsx             (93 lines)   — Point-of-sale terminal
│   ├── Franchise.jsx       (49 lines)   — Franchise applications
│   ├── WhatsAppViral.jsx   (138 lines)  — WA API + templates + viral
│   ├── Marketing.jsx       (53 lines)   — Campaign analytics
│   ├── CRM.jsx             (45 lines)   — Customer management
│   ├── PartnerIDs.jsx      (41 lines)   — 158 API key config
│   ├── CommHub.jsx         (314 lines)  — Multi-channel comms
│   ├── PincodeManager.jsx  (353 lines)  — Pincode mapping + map
│   ├── AIInsights.jsx      (144 lines)  — AI/ML dashboards
│   ├── SecurityDashboard.jsx(85 lines)  — Audit + threats
│   ├── DataLifecycle.jsx   (140 lines)  — GDPR + retention
│   ├── RBAC.jsx            (43 lines)   — Role permissions
│   └── Settings.jsx        (45 lines)   — 65 global settings
├── auth/
│   ├── AdminLoginModal.jsx (144 lines)  — Email/password auth
│   └── UserAuthModal.jsx   (224 lines)  — OTP auth (SMS/WA/Email)
├── layout/
│   ├── AdminSidebar.jsx    (30 lines)   — Tab navigation
│   └── TopBar.jsx          (67 lines)   — Header + user info
├── shared/
│   ├── Badge.jsx           (13 lines)   — Status badges
│   ├── StatCard.jsx        (15 lines)   — Metric cards
│   ├── Toggle.jsx          (14 lines)   — Switch component
│   └── Icons.jsx           (22 lines)   — SVG icon library
└── store/
    ├── StoreView.jsx       (502 lines)  — Full storefront
    └── FranchiseForm.jsx   (145 lines)  — Franchise inquiry
```

---

## 4. Data Architecture

### 4.1 Data Modules

The data layer consists of 13 JavaScript modules in `src/data/` that provide initial seed data and configuration. Each module exports arrays or objects consumed by AppContext on initialization.

| Module | Exports | Records | Description |
|---|---|---|---|
| stores.js | stores array | 18 stores | Store definitions with GPS, zones, hours, ratings |
| orders.js | orders array | Seed orders | Sample order data with status pipeline |
| products.js | products array | Menu items | Product catalog with pricing, stock, tags |
| partners.js | partnerConfig object | 47 sections, 158 keys | All third-party API configurations |
| offers.js | offersConfig, rewardsConfig | 8 offers + tier config | Promotional offers and loyalty program |
| whatsapp.js | waTemplates, viralCampaigns | 6 templates, 6 campaigns | WhatsApp message templates and viral programs |
| pincodes.js | chennaipincodes, allChennaiPincodes, chennaiDeliveryPartners | 34 mapped + 52 total + 14 partners | Pincode delivery mapping system |
| settings.js | settingsConfig, getDefaultSettings | 65 settings in 6 groups | Global platform configuration |
| roles.js | ROLES, ADMIN_TABS | 4 roles, 18 tabs | RBAC definitions |
| crm.js | customers seed | Sample customers | Customer database seeds |
| delivery.js | deliveryZones, deliveryPartners | Zones + partners | Delivery configuration |
| franchise.js | franchises seed | Franchise records | Franchise application data |
| stock.js | stock seed | Inventory items | Warehouse stock levels |

### 4.2 Settings Architecture

The settings system is organized into 6 groups with 65 individual settings, all editable through the admin UI:

**⚙️ General** (5 settings): Store name, GST rate, currency, timezone, support phone

**📲 OTP & Authentication** (13 settings): SMS/WhatsApp/Email OTP toggles, provider selects (12 SMS providers, 9 WhatsApp providers, 10 email providers), OTP length, expiry, max attempts, resend cooldown, DLT template ID, WhatsApp template name, email subject

**🛵 Delivery** (8 settings): Free delivery threshold (₹499), delivery charge (₹29), express surcharge, max radius, COD toggle/limit, default partner, auto-assign

**📅 Slots** (2 settings): Slot booking toggle, advance days

**🎁 Viral Marketing** (10 settings): Referral toggle/amounts, loyalty points toggle/rates, share reward, first order discount, freebie toggle/item/min order

**🏢 Franchise** (7 settings): Franchise mode toggle, default royalty, min/max investment, form toggle, contact email/phone

### 4.3 Partner Integration Architecture

The partners system manages 158 API key fields across 47 provider sections organized into 6 categories:

```
Partners (158 API Keys)
├── 💚 WhatsApp (9 providers, ~30 keys)
│   ├── Meta Official Cloud API
│   │   └── WA_ACCESS_TOKEN, WA_PHONE_NUMBER_ID, WA_BUSINESS_ACCOUNT_ID,
│   │       WA_VERIFY_TOKEN, WA_APP_SECRET, WA_CATALOG_ID, META_APP_ID, META_PIXEL_ID
│   ├── Gupshup, WATI, Interakt, AiSensy
│   └── Twilio, MessageBird, 360dialog, Kaleyra
│
├── 📨 SMS (12 providers, ~36 keys)
│   ├── India: MSG91, Textlocal, Kaleyra, Gupshup, 2Factor, ValueFirst, Pinnacle
│   └── Global: Twilio, Vonage/Nexmo, Sinch, Plivo, AWS SNS
│
├── 📧 Email (10 providers, ~30 keys)
│   ├── Global: SendGrid, AWS SES, Mailgun, Postmark, Resend, Brevo, Mailchimp
│   └── India: Zoho Mail, Pepipost/Netcore, Custom SMTP
│
├── 💳 Payment (4 providers, ~16 keys)
│   ├── India: Razorpay, Cashfree, PayU
│   └── Global: Stripe
│
├── 🛵 Delivery (12 providers, ~36 keys)
│   ├── Hyperlocal: Dunzo, Swiggy Genie, Porter, Borzo, Pidge, Rapido B2B
│   ├── Last-mile: Shadowfax, Loadshare, Blowhorn
│   ├── EV: Zypp Electric
│   └── Aggregator/Express: Shiprocket, Delhivery, Ecom Express
│
└── 🌍 Analytics (1 section, ~10 keys)
    └── Google Maps, Google Analytics, Meta Pixel, Firebase, Mixpanel
```

---

## 5. Frontend Architecture

### 5.1 Customer Storefront

The storefront (`StoreView.jsx`, 502 lines) implements a tab-based SPA with 5 pages:

```
StoreView
├── Hero Section (brand gradient + live stats)
├── Navigation (5 tabs with badge counts)
│
├── [Menu Page]
│   ├── Offer Carousel (horizontal scroll, tap-to-apply)
│   ├── Store Selector (auto-nearest via geolocation)
│   ├── Delivery Promise Banner (configurable thresholds)
│   ├── Category Filter (dynamic from products)
│   ├── Product Grid (stock-aware, inline +/- controls)
│   └── WhatsApp CTA (deep link to WA chat)
│
├── [Offers Page]
│   ├── Offer Cards Grid (8 offers with apply buttons)
│   └── Referral Share Section (Web Share API)
│
├── [Rewards Page]
│   ├── Current Tier Card (progress bar)
│   ├── Tier Grid (4 tiers with perks)
│   └── How It Works (earn/refer/redeem/signup)
│
├── [Orders Page]
│   └── Order Cards (status badge, items, ETA)
│
├── [Franchise Page]
│   └── FranchiseForm.jsx (lazy-loaded)
│
├── Floating Cart Bar (fixed bottom, gold gradient)
└── Checkout Drawer (bottom sheet modal)
    ├── Cart Items (quantity controls)
    ├── Coupon Input + Apply
    ├── Price Breakdown (subtotal + GST + delivery − discount)
    ├── Delivery/Pickup Toggle
    ├── Customer Details Form
    └── Place Order Button
```

### 5.2 Location Detection Flow

```
Page Load
  │
  ├─→ navigator.geolocation.getCurrentPosition()
  │     │
  │     ├─→ Success: setUserLocation({ lat, lng })
  │     │     │
  │     │     └─→ useEffect: Calculate distance to all activeStores
  │     │           └─→ setSelectedStore(nearest.id)
  │     │
  │     └─→ Failure: User selects store manually
  │
  └─→ Badge: "📍 Location detected · Nearest store selected"
```

### 5.3 Delivery Fee Logic

```
Cart Total >= DELIVERY_FREE_ABOVE (₹499)?
  ├─→ YES: deliveryFee = 0 (shows "₹29 → FREE" strikethrough)
  └─→ NO:  deliveryFee = DELIVERY_CHARGE (₹29)
           Shows: "💡 Add ₹X more for FREE delivery"

Order Type === 'pickup'?
  └─→ deliveryFee = 0 (always)

All values from Admin → Settings → 🛵 Delivery
```

### 5.4 Coupon Application Flow

```
User enters coupon code
  │
  ├─→ Search offers[] for matching code (case-insensitive)
  │     ├─→ Not found: show("Invalid coupon code", "error")
  │     └─→ Found + active:
  │           ├─→ Check minOrder: cartTotal >= offer.minOrder?
  │           │     └─→ No: show("Min order ₹X required", "error")
  │           └─→ Set appliedOffer, calculate discount:
  │                 ├─→ discountType 'percent': min(cartTotal * %, maxDiscount)
  │                 ├─→ discountType 'flat': fixed amount
  │                 └─→ discountType 'freebie': 0 (item added separately)
  │
  └─→ grandTotal = cartTotal + GST + deliveryFee - discount
```

---

## 6. Security Architecture

### 6.1 Authentication

**Admin Authentication**: Email/password validation against hardcoded credentials in AppContext. Four roles (superadmin, admin, manager, franchise) with different module access levels.

**Customer Authentication**: Multi-channel OTP system supporting SMS, WhatsApp, and Email. OTP generation, delivery channel selection, and verification flow managed through UserAuthModal.jsx (224 lines).

### 6.2 RBAC (Role-Based Access Control)

```
Roles:
├── superadmin: All 18 modules
├── admin: 16 modules (excludes RBAC, some security)
├── manager: 10 modules (operations-focused)
└── franchise: 5 modules (store, orders, POS, stock, settings)

Per-module visibility configured via Admin → RBAC
Each role has toggleable access to each admin tab
```

### 6.3 Security Middleware

The security middleware (`src/lib/security/middleware.js`, 105 lines) provides:
- Rate limiting with configurable windows
- CSRF token generation and validation
- Request signing and verification
- Audit log generation
- IP-based threat detection

### 6.4 API Security

- Health endpoint returns version info, no sensitive data
- Order API validates request structure
- WhatsApp webhook verifies Meta signature
- GraphQL endpoint includes query complexity limits
- Security audit endpoint restricted to admin roles

---

## 7. AI and Intelligence Layer

### 7.1 AI Engine

The AI engine (`src/lib/ai/engine.js`, 169 lines) provides:

**Anomaly Detection**: Monitors order patterns, revenue deviations, and customer behavior to flag unusual activity. Configurable sensitivity thresholds.

**Demand Forecasting**: Time-series analysis of historical order data to predict demand by product, time slot, and store location.

**Menu Optimization**: Analyzes product performance metrics (orders, revenue, margin) to recommend menu changes, pricing adjustments, and promotional candidates.

**Sentiment Analysis**: Processes customer feedback and review data to surface satisfaction trends and identify issues.

### 7.2 Feature Flags

The feature flag system (`src/lib/featureFlags.js`, 45 lines) enables progressive rollout of new capabilities with percentage-based targeting and override capabilities.

---

## 8. Deployment Architecture

### 8.1 Vercel Configuration

```json
{
  "framework": "nextjs",
  "buildCommand": "next build",
  "regions": ["bom1"],       // Mumbai (closest to Hyderabad/Chennai)
  "headers": [               // Security headers
    "X-Content-Type-Options: nosniff",
    "X-Frame-Options: DENY",
    "Referrer-Policy: strict-origin-when-cross-origin"
  ]
}
```

### 8.2 Build Output

```
Route (app)                              Size     First Load JS
┌ ○ /                                    20.1 kB         108 kB
├ ○ /_not-found                          873 B          88.5 kB
├ ƒ /api/ai/anomalies                    0 B
├ ƒ /api/ai/recommendations              0 B
├ ƒ /api/graphql                         0 B
├ ○ /api/health                          0 B
├ ƒ /api/orders                          0 B
├ ○ /api/security/audit                  0 B
└ ƒ /api/whatsapp                        0 B

○ = Static (prerendered)    ƒ = Dynamic (server-rendered)
```

### 8.3 Performance Characteristics

- First Load JS: 108 kB (well under 200 kB budget)
- All 18 admin modules: Lazy-loaded (code-split)
- Static generation for health/security endpoints
- Dynamic rendering for order/AI/webhook endpoints

---

## 9. Database Schema

Two PostgreSQL schema files are provided in `schema/`:

**schema-v10.sql**: Core tables for stores, orders, products, customers, inventory, delivery zones, and franchise records.

**enterprise-v10.sql**: Extended schema with audit logs, security events, AI training data, feature flags, partner configurations, and multi-tenant support.

Both schemas are designed for deployment on Supabase, Neon, or AWS RDS with row-level security policies.

---

## 10. Scalability Path

### Current Architecture (v10.4)
- Monolithic Next.js application
- Client-side state management (React Context)
- Seed data in JavaScript modules
- 7 API routes

### Planned Evolution
1. **Database Integration**: Connect PostgreSQL schema via Supabase/Prisma
2. **State Migration**: Move to server state with React Query/SWR
3. **Microservices**: Extract order, delivery, and payment into separate services
4. **Real-time**: Add WebSocket/SSE for live order tracking
5. **CDN**: Edge caching for product catalog and static assets
6. **Multi-tenant**: Franchise-specific configurations and isolated data

---

## 11. Appendix

### 11.1 Brand System

```javascript
// src/lib/brand.js
const brand = {
  bg: '#0A0A0B',           // Primary background
  bg2: '#111113',          // Secondary background
  card: '#16161A',         // Card background
  border: '#2A2A2E',       // Border color
  text: '#E4E4E7',         // Body text
  heading: '#FAFAFA',      // Heading text
  dim: '#71717A',          // Muted text
  gold: '#C9A84C',         // Primary accent (Mehfil gold)
  saffron: '#E8A838',      // Secondary accent
  emerald: '#10B981',      // Success / active
  red: '#EF4444',          // Error / danger
  blue: '#3B82F6',         // Info / links
  purple: '#8B5CF6',       // Premium / special
  pink: '#EC4899',         // Marketing / campaigns
  fontDisplay: "'Playfair Display', serif",
  fontBody: "'Figtree', system-ui, sans-serif",
};
```

### 11.2 Environment Variables

See `.env.example` for the full list. All 158 API keys can be configured either through environment variables or through the Admin → Partners UI panel.

---

**Document Version: 1.0.1**
**Architecture Classification: Internal — HyperBridge Group**
