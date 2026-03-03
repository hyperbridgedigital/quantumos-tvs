# Charminar Mehfil — Enterprise Ecommerce Platform v10.4.0

**The complete enterprise-grade food commerce platform powering India's fastest-growing Hyderabadi food chain.**

Built with Next.js 15, React 19, and a modular admin architecture spanning 18 admin modules, 158 API key integrations, 18 store locations, and a premium customer-facing storefront with viral marketing, loyalty rewards, and franchise acquisition.

---

## Quick Start

```bash
# Install dependencies
npm install

# Development server
npm run dev        # → http://localhost:3000

# Production build
npm run build && npm start

# Deploy to Vercel
vercel --prod
```

### Default Admin Credentials

| Email | Password | Role |
|---|---|---|
| spadensilver@gmail.com | Super@4455 | Super Admin |
| admin@mehfil.com | Admin@123 | Admin |
| manager@mehfil.com | Manager@1 | Manager |
| franchise@mehfil.com | Franch@1 | Franchise |

---

## Platform Overview

### Customer Storefront

The public-facing storefront features a 5-tab navigation system:

**🍽 Menu** — Product catalog with category filters, inline cart controls (add/remove/quantity), horizontal scrolling offer banners with tap-to-apply coupons, store selector with auto-detection of nearest branch via browser geolocation, 60-minute delivery promise banner, and configurable delivery fee logic (FREE above ₹499, ₹29 below).

**🎁 Offers** — Full-page offer cards displaying all 8 admin-configured promotions (referral, first-order, freebie, bundle, loyalty, flash/happy hours, WhatsApp exclusive, birthday). Each offer shows code, min order, usage stats, and an "Apply & Order" button. Includes referral sharing section with Web Share API and clipboard fallback.

**🏆 Rewards** — Four-tier loyalty program display (Bronze → Silver → Gold → Platinum) with points progress bar, current tier indicator, and "How It Works" section explaining earn rates, referral bonuses, signup bonuses, and redemption ratios. All values sourced from admin-configurable rewardsConfig.

**📦 Orders** — Live order tracker showing order ID, status badge, item summary, total, and ETA countdown. Supports confirmed, preparing, out_for_delivery, and delivered statuses.

**🏢 Franchise** — Dedicated franchise inquiry page with hero section, 4 key stat cards (investment range, royalty, ROI period, outlet count), 6 benefit cards, and a comprehensive application form (name, phone, email, city, investment budget, F&B experience, current business, message). Submits to admin with success confirmation.

**Checkout Drawer** — Bottom-sheet modal with cart items, coupon input with validation, price breakdown (subtotal + GST + delivery − discount), delivery/pickup toggle, customer details form, COD indicator, and "Add ₹X more for FREE delivery" upsell nudge.

### Admin Dashboard (18 Modules)

Access via the subtle admin link in the storefront footer or direct login.

| # | Module | Key | Description |
|---|--------|-----|-------------|
| 1 | 📊 Dashboard | dashboard | Real-time KPIs: revenue, orders, AOV, conversion, top products, hourly trends |
| 2 | 📦 Orders (OMS) | orders | Full order management: status pipeline, filters, bulk actions, delivery assignment |
| 3 | 🏪 Stores | stores | 18-store manager with zones, hours, load balancing, ratings, GPS coordinates |
| 4 | 🚀 Delivery Engine | delivery | Zone management, partner assignment, SLA monitoring, radius configuration |
| 5 | 📦 Stock/WMS | stock | Inventory tracking, low-stock alerts, reorder points, batch management |
| 6 | 🧾 POS | pos | Point-of-sale terminal for walk-in orders with receipt generation |
| 7 | 🏢 Franchise | franchise | Franchise management: applications, royalty tracking, compliance, territories |
| 8 | 💚 WhatsApp Viral | whatsapp | Meta Cloud API config, message templates, AI chatbot, viral campaigns |
| 9 | 📣 Marketing | marketing | Campaign analytics, viral revenue tracking, customer LTV, conversion metrics |
| 10 | 👥 CRM | crm | Customer database, tier management, mood tracking, communication history |
| 11 | 🔑 Partners | partners | 158 API keys across 47 provider sections (WhatsApp, SMS, Email, Payment, Delivery, Analytics) |
| 12 | 📡 Comm Hub | commhub | Multi-channel communication: SMS, Email, WhatsApp, Push with template management |
| 13 | 📍 Pincodes | pincodes | Pincode-to-store mapping, map view, radius-based bulk selection, delivery time/fee config |
| 14 | 🤖 AI Center | ai | Anomaly detection, demand forecasting, menu optimization, sentiment analysis |
| 15 | 🔒 Security | security | Audit logs, threat monitoring, compliance dashboard, vulnerability tracking |
| 16 | 🗄 Data Lifecycle | data | GDPR compliance, data retention policies, export/purge workflows |
| 17 | 🛡 RBAC | rbac | Role-based access control: 4 roles, per-module tab visibility configuration |
| 18 | ⚙️ Settings | settings | Global config: General, OTP, Delivery, Slots, Viral Marketing, Franchise (65 settings) |

---

## Store Network

### Hyderabad (16 Stores)

| ID | Name | Area | Type |
|---|---|---|---|
| ST001 | Charminar Mehfil Heritage | Old City / Charminar | flagship |
| ST002 | Mehfil Jubilee Hills | Jubilee Hills Rd 36 | premium |
| ST003 | Mehfil Banjara Express | Banjara Hills Rd 12 | express |
| ST004 | Mehfil Madhapur Tech Hub | Madhapur / Hitech City | express |
| ST005 | Mehfil Kukatpally | KPHB Colony | standard |
| ST006 | Mehfil Secunderabad Club | Secunderabad, MG Road | premium |
| ST007 | Mehfil Tolichowki | Tolichowki | standard |
| ST008 | Mehfil Miyapur | Miyapur Main Road | express |
| ST009 | Mehfil Ameerpet | Ameerpet Junction | cloud |
| ST010 | Mehfil Gachibowli | Financial District | premium |
| ST011 | Mehfil Dilsukhnagar | Dilsukhnagar Main Road | standard |
| ST012 | Mehfil LB Nagar | LB Nagar Ring Road | standard |
| ST013 | Mehfil Abids | Abids / GPO | express |
| ST014 | Mehfil Kompally | Kompally ORR | franchise |
| ST015 | Mehfil Uppal | Uppal Metro Station | franchise |
| ST016 | Mehfil Shamshabad | Airport Road | cloud |

### Chennai (2 Stores)

| ID | Name | Address | Type |
|---|---|---|---|
| ST017 | Charminar Mehfil T. Nagar | 1, Thanikachalam Rd, T. Nagar, Chennai 600017 | flagship |
| ST018 | Charminar Mehfil ECR Sangam | 281, East Coast Rd, Akkarai, Sholinganallur, Chennai 600119 | premium |

---

## Integration Partners (158 API Keys)

### WhatsApp Business API (9 providers)
Meta Official Cloud API, Gupshup, WATI, Interakt, AiSensy, Twilio, MessageBird, 360dialog, Kaleyra

### SMS Gateway (12 providers)
MSG91, Textlocal, Kaleyra, Gupshup, 2Factor, ValueFirst, Pinnacle, Twilio, Vonage/Nexmo, Sinch, Plivo, AWS SNS

### Email Service (10 providers)
SendGrid, AWS SES, Mailgun, Postmark, Resend, Brevo/Sendinblue, Zoho Mail, Pepipost/Netcore, Mailchimp/Mandrill, Custom SMTP

### Payment Gateway (4 providers)
Razorpay, Cashfree, PayU, Stripe

### Delivery Partners (12 providers)
Dunzo, Swiggy Genie, Porter, Shadowfax, Borzo/WeFast, Loadshare, Pidge, Rapido B2B, Zypp Electric, Shiprocket, Delhivery, Ecom Express

### Analytics & Maps
Google Maps, Google Analytics, Meta Pixel

---

## Pincode Delivery System

52 Chennai pincodes available for assignment. 34 pre-mapped with delivery time and fee data. Pincodes are assigned to stores with configurable delivery windows (18–40 min) and fees (₹0–35).

Admin features include map-based visualization with Google Maps, radius-based bulk pincode selection (3/5/8/10/15 km), inline editing for delivery time and fee per pincode, bulk update for all pincodes on a store, and a delivery partner configuration panel showing all 14 Chennai-area partners.

---

## Multi-Channel OTP Authentication

Supports SMS, WhatsApp, and Email OTP with admin-configurable settings: provider selection per channel, OTP length (4 or 6 digits), expiry (default 300s), max attempts (5), resend cooldown (30s), and DLT template IDs for Indian SMS compliance.

---

## Viral Marketing & Offers

8 pre-configured offer types, all admin-editable:

| Code | Type | Offer |
|---|---|---|
| MEHFIL100 | Referral | ₹100 off for friend, ₹100 wallet credit for referrer |
| WELCOME20 | First Order | 20% off, max ₹150 |
| FREECHAI | Freebie | Free Irani Chai with biryani above ₹349 |
| FAMILY200 | Bundle | ₹200 off on 4+ biryanis |
| LOYAL5 | Loyalty | Every 5th order gets free Double Ka Meetha |
| HAPPY15 | Flash | 15% off 2–5 PM, max ₹120 |
| WACHAT75 | WhatsApp | ₹75 off WhatsApp orders |
| BDAY25 | Birthday | 25% off on birthday, max ₹300 |

4-tier loyalty system: Bronze (1x) → Silver (1.5x at 500pts) → Gold (2x at 2000pts) → Platinum (3x at 5000pts)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15.1 (App Router) |
| UI | React 19, Inline CSS-in-JS |
| Styling | CSS Custom Properties, brand system |
| State | React Context + useState |
| Deployment | Vercel (Edge, Serverless) |
| Database Schema | PostgreSQL (provided, not connected in demo) |
| APIs | 7 REST/GraphQL endpoints |
| Authentication | Role-based (4 roles), Multi-channel OTP |
| Security | Rate limiting, CSRF, audit logging, encryption middleware |

---

## API Endpoints

| Method | Route | Purpose |
|---|---|---|
| GET | /api/health | Service health check and version |
| POST/GET | /api/orders | Order CRUD with filtering |
| POST | /api/whatsapp | WhatsApp webhook (Meta Cloud API) |
| POST | /api/graphql | GraphQL endpoint for flexible queries |
| GET | /api/ai/anomalies | AI anomaly detection |
| GET | /api/ai/recommendations | AI menu optimization |
| GET | /api/security/audit | Security audit log export |

---

## Project Stats

| Metric | Value |
|---|---|
| Version | 10.4.0-enterprise |
| Total Files | 70 |
| Lines of Code | 6,370 |
| Admin Modules | 18 |
| API Keys | 158 across 47 providers |
| Store Locations | 18 (16 Hyderabad + 2 Chennai) |
| Chennai Pincodes | 52 available, 34 pre-mapped |
| Delivery Partners | 14 (Chennai hyperlocal) |
| Customer Offers | 8 configurable |
| Loyalty Tiers | 4 (Bronze → Platinum) |
| Viral Campaigns | 6 |
| WhatsApp Templates | 6 |
| Settings | 65 admin-configurable |
| RBAC Roles | 4 (superadmin, admin, manager, franchise) |
| Build Size | 108 kB first load JS |
| Build Errors | 0 |

---

## File Structure

```
cmv10/
├── src/
│   ├── app/
│   │   ├── page.jsx              # Main entry: storefront + admin router
│   │   ├── layout.jsx            # Root layout with fonts and metadata
│   │   ├── globals.css           # Brand CSS variables and animations
│   │   └── api/                  # 7 API routes
│   ├── components/
│   │   ├── admin/                # 18 admin modules
│   │   ├── auth/                 # AdminLoginModal, UserAuthModal (OTP)
│   │   ├── layout/               # AdminSidebar, TopBar
│   │   ├── shared/               # Badge, StatCard, Toggle, Icons
│   │   └── store/                # StoreView (502 lines), FranchiseForm
│   ├── context/
│   │   └── AppContext.jsx        # Global state provider (463 lines)
│   ├── data/                     # 13 data modules (stores, orders, partners, etc.)
│   └── lib/                      # Brand config, utils, AI engine, security middleware
├── schema/                       # PostgreSQL DDL scripts
├── package.json
├── vercel.json
└── next.config.js
```

---

## Version History

| Version | Highlights |
|---|---|
| v10.4 | Frontend rebuild: viral offers/rewards/referrals, location auto-detect, franchise form, configurable delivery, floating cart |
| v10.3 | 2 Chennai stores, pincode mapping (52 pins), 14 delivery partners, 18 new API keys |
| v10.2 | Multi-channel OTP (SMS/WA/Email), 16 real Hyderabad stores, admin OTP panel |
| v10.1 | 17→18 admin modules, Comm Hub, 140 API keys, enterprise security |
| v10.0 | Foundation: Next.js 15, React 19, RBAC, POS, WMS, AI Center |

---

## Deployment

Optimized for Vercel with edge middleware. Production build produces static pages where possible and server-renders dynamic API routes.

```bash
vercel --prod
```

Environment variables are managed through the Admin → Partners panel (158 keys) and Admin → Settings (65 configs). See .env.example for the full list.

---

## License

Proprietary — Charminar Mehfil / HyperBridge Group. All rights reserved.

**Document Version: 1.0.1**
