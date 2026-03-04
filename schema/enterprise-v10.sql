-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║  THEVALUESTORE (TVS) v10 — ENTERPRISE DATABASE SCHEMA                  ║
-- ║  Multi-tenant · Partitioned · RLS · AI-Ready · SOC2 Compliant       ║
-- ╚══════════════════════════════════════════════════════════════════════╝

-- ═══════════════════════════════════════════════════════════════
-- 0. EXTENSIONS
-- ═══════════════════════════════════════════════════════════════
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";       -- fuzzy search
CREATE EXTENSION IF NOT EXISTS "pg_cron";        -- scheduled jobs

-- ═══════════════════════════════════════════════════════════════
-- 1. ENUMS
-- ═══════════════════════════════════════════════════════════════
CREATE TYPE user_role AS ENUM ('superadmin','admin','manager','franchise','staff','customer','delivery');
CREATE TYPE order_status AS ENUM ('pending','confirmed','preparing','ready','out_for_delivery','delivered','cancelled','refunded');
CREATE TYPE store_status AS ENUM ('active','upcoming','maintenance','closed');
CREATE TYPE partner_status AS ENUM ('available','delivering','offline','break');
CREATE TYPE franchise_status AS ENUM ('active','setup','suspended','closed');
CREATE TYPE tier_level AS ENUM ('bronze','silver','gold','platinum');
CREATE TYPE data_temp AS ENUM ('hot','warm','cold','archived');
CREATE TYPE wa_tpl_status AS ENUM ('approved','pending','rejected');
CREATE TYPE payment_method AS ENUM ('upi','cash','card','wallet','cod');
CREATE TYPE ai_model_type AS ENUM ('anomaly','fraud','recommendation','forecast','sentiment','chatbot');

-- ═══════════════════════════════════════════════════════════════
-- 2. MULTI-TENANT CORE
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  domain TEXT UNIQUE,
  plan TEXT NOT NULL DEFAULT 'starter', -- starter|growth|enterprise
  settings JSONB NOT NULL DEFAULT '{}',
  feature_flags JSONB NOT NULL DEFAULT '{}',
  subscription_status TEXT DEFAULT 'active',
  mrr INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'staff',
  permissions JSONB NOT NULL DEFAULT '[]',
  avatar_url TEXT,
  mfa_enabled BOOLEAN DEFAULT FALSE,
  mfa_secret TEXT, -- AES-256 encrypted
  last_login TIMESTAMPTZ,
  failed_logins INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL, -- bcrypt hash
  prefix TEXT NOT NULL, -- first 8 chars for identification
  scopes JSONB NOT NULL DEFAULT '["read"]',
  rate_limit INTEGER DEFAULT 1000, -- per hour
  last_used TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- 3. STORES
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  status store_status DEFAULT 'active',
  address TEXT, city TEXT, state TEXT, pincode TEXT,
  lat DECIMAL(10,7), lng DECIMAL(10,7),
  phone TEXT, manager_id UUID REFERENCES profiles(id),
  hours TEXT DEFAULT '08:00-22:00',
  radius_km INTEGER DEFAULT 5,
  prep_time_min INTEGER DEFAULT 20,
  max_concurrent_orders INTEGER DEFAULT 50,
  current_load INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0,
  seating INTEGER DEFAULT 0,
  delivery BOOLEAN DEFAULT TRUE,
  pickup BOOLEAN DEFAULT TRUE,
  dine_in BOOLEAN DEFAULT FALSE,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, code)
);

-- ═══════════════════════════════════════════════════════════════
-- 4. PRODUCTS & CATEGORIES
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  UNIQUE(tenant_id, slug)
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  category_id UUID REFERENCES categories(id),
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- in paise
  compare_price INTEGER,
  cost_price INTEGER,
  tax_rate DECIMAL(4,2) DEFAULT 5.0,
  image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  active BOOLEAN DEFAULT TRUE,
  available BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  nutrition JSONB DEFAULT '{}',
  variants JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, sku)
);

-- ═══════════════════════════════════════════════════════════════
-- 5. ORDERS (High-volume, indexed)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  order_number TEXT NOT NULL,
  store_id UUID NOT NULL REFERENCES stores(id),
  customer_id UUID REFERENCES profiles(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  status order_status DEFAULT 'pending',
  type TEXT DEFAULT 'delivery', -- delivery|pickup|dine_in
  items JSONB NOT NULL,
  subtotal INTEGER NOT NULL,
  tax INTEGER DEFAULT 0,
  delivery_fee INTEGER DEFAULT 0,
  discount INTEGER DEFAULT 0,
  total INTEGER NOT NULL,
  payment_method payment_method DEFAULT 'upi',
  payment_status TEXT DEFAULT 'pending',
  payment_ref TEXT,
  address TEXT,
  lat DECIMAL(10,7), lng DECIMAL(10,7),
  delivery_partner_id UUID,
  estimated_delivery TIMESTAMPTZ,
  actual_delivery TIMESTAMPTZ,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  placed_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  prepared_at TIMESTAMPTZ,
  dispatched_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancel_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, order_number)
);

CREATE INDEX idx_orders_tenant_status ON orders(tenant_id, status);
CREATE INDEX idx_orders_store ON orders(store_id, status);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_placed ON orders(placed_at DESC);
CREATE INDEX idx_orders_phone ON orders(customer_phone);

-- ═══════════════════════════════════════════════════════════════
-- 6. STOCK / WMS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE stock_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  store_id UUID NOT NULL REFERENCES stores(id),
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'raw_material',
  quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit TEXT DEFAULT 'kg',
  reorder_level DECIMAL(10,2) DEFAULT 10,
  cost_per_unit INTEGER DEFAULT 0,
  supplier TEXT,
  last_restock TIMESTAMPTZ,
  expiry_date DATE,
  batch_number TEXT,
  location TEXT, -- warehouse location code
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, store_id, sku)
);

CREATE INDEX idx_stock_low ON stock_items(tenant_id, store_id) WHERE quantity <= reorder_level;

-- ═══════════════════════════════════════════════════════════════
-- 7. DELIVERY
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE delivery_partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  store_id UUID NOT NULL REFERENCES stores(id),
  profile_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  vehicle TEXT DEFAULT 'bike',
  status partner_status DEFAULT 'offline',
  current_orders INTEGER DEFAULT 0,
  max_orders INTEGER DEFAULT 3,
  today_completed INTEGER DEFAULT 0,
  avg_time_min INTEGER DEFAULT 20,
  rating DECIMAL(2,1) DEFAULT 4.5,
  lat DECIMAL(10,7), lng DECIMAL(10,7),
  last_ping TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE delivery_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  store_id UUID NOT NULL REFERENCES stores(id),
  name TEXT NOT NULL,
  polygon JSONB, -- GeoJSON polygon
  fee INTEGER DEFAULT 0,
  min_order INTEGER DEFAULT 0,
  max_delivery_min INTEGER DEFAULT 30,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- 8. CRM / CUSTOMERS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  profile_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  tier tier_level DEFAULT 'bronze',
  total_orders INTEGER DEFAULT 0,
  lifetime_value INTEGER DEFAULT 0,
  avg_order_value INTEGER DEFAULT 0,
  last_order_at TIMESTAMPTZ,
  mood TEXT DEFAULT '😊',
  tags TEXT[] DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  gdpr_consent BOOLEAN DEFAULT FALSE,
  gdpr_consent_at TIMESTAMPTZ,
  marketing_opt_in BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, phone)
);

CREATE INDEX idx_customers_tier ON customers(tenant_id, tier);
CREATE INDEX idx_customers_ltv ON customers(tenant_id, lifetime_value DESC);

-- ═══════════════════════════════════════════════════════════════
-- 9. FRANCHISE
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE franchises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  store_id UUID REFERENCES stores(id),
  name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  owner_phone TEXT,
  owner_email TEXT,
  city TEXT,
  status franchise_status DEFAULT 'setup',
  royalty_pct DECIMAL(4,2) DEFAULT 12.0,
  total_revenue INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  investment INTEGER DEFAULT 0,
  agreement_signed BOOLEAN DEFAULT FALSE,
  agreement_url TEXT,
  since DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- 10. WHATSAPP / META
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE wa_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name TEXT NOT NULL,
  category TEXT DEFAULT 'UTILITY',
  language TEXT DEFAULT 'en',
  body TEXT NOT NULL,
  params INTEGER DEFAULT 0,
  status wa_tpl_status DEFAULT 'pending',
  meta_template_id TEXT,
  sent_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, name)
);

CREATE TABLE wa_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name TEXT NOT NULL,
  description TEXT,
  template_id UUID REFERENCES wa_templates(id),
  type TEXT DEFAULT 'blast', -- blast|referral|drip|trigger
  active BOOLEAN DEFAULT FALSE,
  total_shares INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  revenue INTEGER DEFAULT 0,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- 11. PARTNER CONFIG (encrypted)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE partner_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  category TEXT NOT NULL, -- payment|whatsapp|sms|email|delivery|analytics
  partner TEXT NOT NULL,
  key TEXT NOT NULL,
  value_encrypted TEXT NOT NULL, -- pgp_sym_encrypt(value, secret)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, key)
);

-- ═══════════════════════════════════════════════════════════════
-- 12. FEATURE FLAGS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id), -- NULL = global
  key TEXT NOT NULL,
  enabled BOOLEAN DEFAULT FALSE,
  rollout_pct INTEGER DEFAULT 0, -- 0-100 gradual rollout
  config JSONB DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, key)
);

-- ═══════════════════════════════════════════════════════════════
-- 13. SETTINGS (per-tenant)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  type TEXT DEFAULT 'text', -- text|number|toggle|json
  section TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, key)
);

-- ═══════════════════════════════════════════════════════════════
-- 14. MONETIZATION / LEDGER
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  plan TEXT NOT NULL,
  price INTEGER NOT NULL, -- monthly in paise
  billing_cycle TEXT DEFAULT 'monthly',
  status TEXT DEFAULT 'active',
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  payment_gateway TEXT DEFAULT 'razorpay',
  gateway_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ledger_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  type TEXT NOT NULL, -- subscription|order_commission|payout|refund|addon
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'INR',
  reference_id TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Monthly partitions
CREATE TABLE ledger_entries_2025_01 PARTITION OF ledger_entries FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE ledger_entries_2025_02 PARTITION OF ledger_entries FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
CREATE TABLE ledger_entries_2025_03 PARTITION OF ledger_entries FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');
CREATE TABLE ledger_entries_2025_04 PARTITION OF ledger_entries FOR VALUES FROM ('2025-04-01') TO ('2025-05-01');
CREATE TABLE ledger_entries_2025_05 PARTITION OF ledger_entries FOR VALUES FROM ('2025-05-01') TO ('2025-06-01');
CREATE TABLE ledger_entries_2025_06 PARTITION OF ledger_entries FOR VALUES FROM ('2025-06-01') TO ('2025-07-01');
CREATE TABLE ledger_entries_2026_01 PARTITION OF ledger_entries FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE ledger_entries_2026_02 PARTITION OF ledger_entries FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE ledger_entries_2026_03 PARTITION OF ledger_entries FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');

-- ═══════════════════════════════════════════════════════════════
-- 15. PARTITIONED HIGH-VOLUME TABLES
-- ═══════════════════════════════════════════════════════════════

-- AUDIT LOGS (Immutable, SOC2)
CREATE TABLE audit_logs (
  id UUID DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  user_id UUID,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  old_value JSONB,
  new_value JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  severity TEXT DEFAULT 'info', -- info|warning|critical|security
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

CREATE TABLE audit_logs_2025_01 PARTITION OF audit_logs FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE audit_logs_2025_02 PARTITION OF audit_logs FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
CREATE TABLE audit_logs_2025_03 PARTITION OF audit_logs FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');
CREATE TABLE audit_logs_2025_04 PARTITION OF audit_logs FOR VALUES FROM ('2025-04-01') TO ('2025-05-01');
CREATE TABLE audit_logs_2025_05 PARTITION OF audit_logs FOR VALUES FROM ('2025-05-01') TO ('2025-06-01');
CREATE TABLE audit_logs_2025_06 PARTITION OF audit_logs FOR VALUES FROM ('2025-06-01') TO ('2025-07-01');
CREATE TABLE audit_logs_2026_01 PARTITION OF audit_logs FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE audit_logs_2026_02 PARTITION OF audit_logs FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE audit_logs_2026_03 PARTITION OF audit_logs FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');

CREATE INDEX idx_audit_tenant ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX idx_audit_action ON audit_logs(action, created_at DESC);
CREATE INDEX idx_audit_severity ON audit_logs(severity) WHERE severity IN ('critical','security');

-- ORDER EVENTS (for real-time tracking)
CREATE TABLE order_events (
  id UUID DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  order_id UUID NOT NULL,
  event TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  actor_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

CREATE TABLE order_events_2025_01 PARTITION OF order_events FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE order_events_2025_06 PARTITION OF order_events FOR VALUES FROM ('2025-06-01') TO ('2025-07-01');
CREATE TABLE order_events_2026_01 PARTITION OF order_events FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE order_events_2026_02 PARTITION OF order_events FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE order_events_2026_03 PARTITION OF order_events FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');

-- ANALYTICS EVENTS (clickstream, funnel)
CREATE TABLE analytics_events (
  id UUID DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  session_id TEXT,
  user_id UUID,
  event_name TEXT NOT NULL,
  properties JSONB DEFAULT '{}',
  page TEXT,
  referrer TEXT,
  device JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

CREATE TABLE analytics_events_2026_01 PARTITION OF analytics_events FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE analytics_events_2026_02 PARTITION OF analytics_events FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE analytics_events_2026_03 PARTITION OF analytics_events FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');

-- NOTIFICATION LOGS
CREATE TABLE notification_logs (
  id UUID DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  channel TEXT NOT NULL, -- whatsapp|sms|email|push
  recipient TEXT NOT NULL,
  template_id UUID,
  status TEXT DEFAULT 'queued',
  provider TEXT,
  provider_id TEXT,
  cost_paise INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

CREATE TABLE notification_logs_2026_01 PARTITION OF notification_logs FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE notification_logs_2026_02 PARTITION OF notification_logs FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE notification_logs_2026_03 PARTITION OF notification_logs FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');

-- TRACKING POINTS (delivery GPS)
CREATE TABLE tracking_points (
  id UUID DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  order_id UUID NOT NULL,
  partner_id UUID NOT NULL,
  lat DECIMAL(10,7) NOT NULL,
  lng DECIMAL(10,7) NOT NULL,
  speed DECIMAL(5,1),
  heading INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

CREATE TABLE tracking_points_2026_01 PARTITION OF tracking_points FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE tracking_points_2026_02 PARTITION OF tracking_points FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE tracking_points_2026_03 PARTITION OF tracking_points FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');

-- ═══════════════════════════════════════════════════════════════
-- 16. AGGREGATED ROLLUP TABLES (Dashboard performance)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE rollup_daily_revenue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  store_id UUID REFERENCES stores(id),
  date DATE NOT NULL,
  total_orders INTEGER DEFAULT 0,
  total_revenue INTEGER DEFAULT 0,
  avg_order_value INTEGER DEFAULT 0,
  delivery_orders INTEGER DEFAULT 0,
  pickup_orders INTEGER DEFAULT 0,
  dine_in_orders INTEGER DEFAULT 0,
  cancelled_orders INTEGER DEFAULT 0,
  unique_customers INTEGER DEFAULT 0,
  new_customers INTEGER DEFAULT 0,
  avg_delivery_time INTEGER DEFAULT 0,
  UNIQUE(tenant_id, store_id, date)
);

CREATE TABLE rollup_hourly_load (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  store_id UUID NOT NULL,
  hour TIMESTAMPTZ NOT NULL,
  orders INTEGER DEFAULT 0,
  revenue INTEGER DEFAULT 0,
  avg_prep_time INTEGER DEFAULT 0,
  peak_load INTEGER DEFAULT 0,
  UNIQUE(tenant_id, store_id, hour)
);

CREATE TABLE rollup_product_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  product_id UUID NOT NULL,
  period DATE NOT NULL, -- first of month
  quantity_sold INTEGER DEFAULT 0,
  revenue INTEGER DEFAULT 0,
  avg_rating DECIMAL(2,1) DEFAULT 0,
  return_rate DECIMAL(4,2) DEFAULT 0,
  UNIQUE(tenant_id, product_id, period)
);

-- ═══════════════════════════════════════════════════════════════
-- 17. AI LAYER TABLES
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE ai_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id),
  type ai_model_type NOT NULL,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  accuracy DECIMAL(5,2),
  status TEXT DEFAULT 'training', -- training|active|deprecated
  last_trained TIMESTAMPTZ,
  next_train TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  model_id UUID REFERENCES ai_models(id),
  input JSONB NOT NULL,
  output JSONB NOT NULL,
  confidence DECIMAL(4,3),
  feedback TEXT, -- correct|incorrect|unknown
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_anomalies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  model_id UUID REFERENCES ai_models(id),
  severity TEXT DEFAULT 'medium', -- low|medium|high|critical
  type TEXT NOT NULL, -- revenue_drop|fraud|unusual_pattern|stock_anomaly
  description TEXT NOT NULL,
  data JSONB NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  customer_id UUID REFERENCES customers(id),
  type TEXT NOT NULL, -- product|upsell|reorder|menu|timing
  items JSONB NOT NULL,
  score DECIMAL(4,3),
  shown BOOLEAN DEFAULT FALSE,
  converted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE fraud_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  order_id UUID REFERENCES orders(id),
  signal_type TEXT NOT NULL, -- velocity|address_mismatch|payment_pattern|device_fingerprint
  risk_score DECIMAL(4,3) NOT NULL,
  details JSONB NOT NULL,
  action_taken TEXT, -- flagged|blocked|approved|manual_review
  reviewed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fraud_risk ON fraud_signals(tenant_id, risk_score DESC) WHERE action_taken = 'flagged';

-- ═══════════════════════════════════════════════════════════════
-- 18. DATA LIFECYCLE MANAGEMENT
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE data_lifecycle_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id),
  table_name TEXT NOT NULL,
  hot_days INTEGER DEFAULT 30,
  warm_days INTEGER DEFAULT 180,
  archive_after_days INTEGER DEFAULT 365,
  purge_after_days INTEGER DEFAULT 730,
  auto_partition BOOLEAN DEFAULT TRUE,
  archive_to TEXT DEFAULT 'cold_schema', -- cold_schema|s3|gcs
  last_archive TIMESTAMPTZ,
  last_purge TIMESTAMPTZ,
  UNIQUE(tenant_id, table_name)
);

CREATE TABLE partition_health (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  partition_name TEXT NOT NULL,
  row_count BIGINT DEFAULT 0,
  size_bytes BIGINT DEFAULT 0,
  temperature data_temp DEFAULT 'hot',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_checked TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE db_health_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric TEXT NOT NULL,
  value DECIMAL(15,2) NOT NULL,
  unit TEXT DEFAULT 'bytes',
  details JSONB DEFAULT '{}',
  collected_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cold storage schema
CREATE SCHEMA IF NOT EXISTS cold_storage;

-- ═══════════════════════════════════════════════════════════════
-- 19. SECURITY — RATE LIMITING
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL, -- ip:endpoint or api_key:endpoint
  window_start TIMESTAMPTZ NOT NULL,
  request_count INTEGER DEFAULT 1,
  UNIQUE(key, window_start)
);

CREATE TABLE security_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID,
  event_type TEXT NOT NULL, -- login_fail|brute_force|sql_injection|xss|csrf|rate_limit
  ip_address INET,
  user_agent TEXT,
  details JSONB DEFAULT '{}',
  blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_security_ip ON security_events(ip_address, created_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- 20. ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE franchises ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE wa_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE wa_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_signals ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user's tenant
CREATE OR REPLACE FUNCTION get_user_tenant_id() RETURNS UUID AS $$
  SELECT tenant_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_user_role() RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- PROFILES: Users see own tenant's profiles
CREATE POLICY profiles_tenant ON profiles USING (tenant_id = get_user_tenant_id());
CREATE POLICY profiles_self_update ON profiles FOR UPDATE USING (id = auth.uid());

-- STORES: Tenant isolation
CREATE POLICY stores_tenant ON stores USING (tenant_id = get_user_tenant_id());
CREATE POLICY stores_public_read ON stores FOR SELECT USING (status = 'active'); -- storefront

-- PRODUCTS: Tenant isolation + public read for active
CREATE POLICY products_tenant ON products USING (tenant_id = get_user_tenant_id());
CREATE POLICY products_public ON products FOR SELECT USING (active = true AND available = true);

-- ORDERS: Tenant + customer sees own orders
CREATE POLICY orders_tenant ON orders USING (tenant_id = get_user_tenant_id());
CREATE POLICY orders_customer ON orders FOR SELECT USING (customer_id = auth.uid());

-- STOCK: Admin/manager only
CREATE POLICY stock_admin ON stock_items USING (
  tenant_id = get_user_tenant_id()
  AND get_user_role() IN ('superadmin','admin','manager')
);

-- CUSTOMERS: Tenant isolation
CREATE POLICY customers_tenant ON customers USING (tenant_id = get_user_tenant_id());

-- FRANCHISES: Admin/franchise owner
CREATE POLICY franchises_tenant ON franchises USING (tenant_id = get_user_tenant_id());

-- DELIVERY: Tenant + drivers see own
CREATE POLICY delivery_tenant ON delivery_partners USING (tenant_id = get_user_tenant_id());
CREATE POLICY delivery_self ON delivery_partners FOR SELECT USING (profile_id = auth.uid());

-- PARTNER CONFIG: Superadmin only (encrypted values)
CREATE POLICY partner_superadmin ON partner_config USING (
  tenant_id = get_user_tenant_id()
  AND get_user_role() = 'superadmin'
);

-- AUDIT LOGS: Read-only, no delete (immutable)
CREATE POLICY audit_read ON audit_logs FOR SELECT USING (tenant_id = get_user_tenant_id());
-- No UPDATE/DELETE policy = immutable

-- FEATURE FLAGS: Tenant + global
CREATE POLICY flags_tenant ON feature_flags USING (
  tenant_id = get_user_tenant_id() OR tenant_id IS NULL
);

-- SETTINGS: Tenant admin
CREATE POLICY settings_tenant ON settings USING (tenant_id = get_user_tenant_id());

-- AI ANOMALIES: Tenant admin
CREATE POLICY ai_anomalies_tenant ON ai_anomalies USING (tenant_id = get_user_tenant_id());

-- FRAUD: Superadmin only
CREATE POLICY fraud_superadmin ON fraud_signals USING (
  tenant_id = get_user_tenant_id()
  AND get_user_role() IN ('superadmin','admin')
);

-- ═══════════════════════════════════════════════════════════════
-- 21. FUNCTIONS
-- ═══════════════════════════════════════════════════════════════

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION trigger_set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- Immutable audit log trigger
CREATE OR REPLACE FUNCTION audit_log_change() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (tenant_id, user_id, action, resource, resource_id, old_value, new_value)
  VALUES (
    COALESCE(NEW.tenant_id, OLD.tenant_id),
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id::TEXT, OLD.id::TEXT),
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN row_to_json(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_orders AFTER INSERT OR UPDATE OR DELETE ON orders FOR EACH ROW EXECUTE FUNCTION audit_log_change();
CREATE TRIGGER audit_stores AFTER INSERT OR UPDATE OR DELETE ON stores FOR EACH ROW EXECUTE FUNCTION audit_log_change();
CREATE TRIGGER audit_stock AFTER INSERT OR UPDATE OR DELETE ON stock_items FOR EACH ROW EXECUTE FUNCTION audit_log_change();
CREATE TRIGGER audit_products AFTER INSERT OR UPDATE OR DELETE ON products FOR EACH ROW EXECUTE FUNCTION audit_log_change();
CREATE TRIGGER audit_partner_config AFTER INSERT OR UPDATE ON partner_config FOR EACH ROW EXECUTE FUNCTION audit_log_change();

-- Auto-update customer tier on order
CREATE OR REPLACE FUNCTION update_customer_on_order() RETURNS TRIGGER AS $$
BEGIN
  UPDATE customers SET
    total_orders = total_orders + 1,
    lifetime_value = lifetime_value + NEW.total,
    avg_order_value = (lifetime_value + NEW.total) / (total_orders + 1),
    last_order_at = NOW(),
    tier = CASE
      WHEN (lifetime_value + NEW.total) >= 1000000 THEN 'platinum'
      WHEN (lifetime_value + NEW.total) >= 500000 THEN 'gold'
      WHEN (lifetime_value + NEW.total) >= 200000 THEN 'silver'
      ELSE 'bronze'
    END,
    updated_at = NOW()
  WHERE tenant_id = NEW.tenant_id AND phone = NEW.customer_phone;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER order_update_customer AFTER INSERT ON orders FOR EACH ROW EXECUTE FUNCTION update_customer_on_order();

-- Daily rollup function
CREATE OR REPLACE FUNCTION compute_daily_rollup(target_date DATE DEFAULT CURRENT_DATE - 1) RETURNS VOID AS $$
BEGIN
  INSERT INTO rollup_daily_revenue (tenant_id, store_id, date, total_orders, total_revenue, avg_order_value, delivery_orders, pickup_orders, cancelled_orders, unique_customers, new_customers, avg_delivery_time)
  SELECT
    tenant_id, store_id, target_date,
    COUNT(*),
    COALESCE(SUM(total), 0),
    COALESCE(AVG(total), 0)::INTEGER,
    COUNT(*) FILTER (WHERE type = 'delivery'),
    COUNT(*) FILTER (WHERE type = 'pickup'),
    COUNT(*) FILTER (WHERE status = 'cancelled'),
    COUNT(DISTINCT customer_phone),
    0, -- computed separately
    COALESCE(AVG(EXTRACT(EPOCH FROM (delivered_at - placed_at)) / 60), 0)::INTEGER
  FROM orders
  WHERE placed_at::DATE = target_date AND status != 'cancelled'
  GROUP BY tenant_id, store_id
  ON CONFLICT (tenant_id, store_id, date) DO UPDATE SET
    total_orders = EXCLUDED.total_orders,
    total_revenue = EXCLUDED.total_revenue,
    avg_order_value = EXCLUDED.avg_order_value;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════
-- 22. AUTOMATED PARTITION CREATION (pg_cron)
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION create_monthly_partitions() RETURNS VOID AS $$
DECLARE
  next_month DATE := DATE_TRUNC('month', NOW()) + INTERVAL '1 month';
  month_after DATE := next_month + INTERVAL '1 month';
  suffix TEXT := TO_CHAR(next_month, 'YYYY_MM');
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY['audit_logs','order_events','analytics_events','notification_logs','tracking_points','ledger_entries'])
  LOOP
    EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF %I FOR VALUES FROM (%L) TO (%L)', tbl || '_' || suffix, tbl, next_month, month_after);
    RAISE NOTICE 'Created partition: %_%', tbl, suffix;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Archive old data to cold storage
CREATE OR REPLACE FUNCTION archive_cold_data() RETURNS VOID AS $$
DECLARE
  cfg RECORD;
BEGIN
  FOR cfg IN SELECT * FROM data_lifecycle_config WHERE archive_after_days > 0
  LOOP
    EXECUTE format(
      'INSERT INTO cold_storage.%I SELECT * FROM %I WHERE created_at < NOW() - INTERVAL ''%s days'' ON CONFLICT DO NOTHING',
      cfg.table_name, cfg.table_name, cfg.archive_after_days
    );
    EXECUTE format(
      'DELETE FROM %I WHERE created_at < NOW() - INTERVAL ''%s days''',
      cfg.table_name, cfg.archive_after_days
    );
    UPDATE data_lifecycle_config SET last_archive = NOW() WHERE id = cfg.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Schedule automated jobs
SELECT cron.schedule('create-partitions', '0 0 25 * *', 'SELECT create_monthly_partitions()');
SELECT cron.schedule('daily-rollup', '0 2 * * *', 'SELECT compute_daily_rollup()');
SELECT cron.schedule('archive-cold', '0 3 * * *', 'SELECT archive_cold_data()');
SELECT cron.schedule('nightly-vacuum', '0 4 * * *', 'VACUUM ANALYZE orders; VACUUM ANALYZE audit_logs; VACUUM ANALYZE analytics_events;');

-- ═══════════════════════════════════════════════════════════════
-- 23. SEED DEFAULT DATA LIFECYCLE CONFIG
-- ═══════════════════════════════════════════════════════════════
INSERT INTO data_lifecycle_config (table_name, hot_days, warm_days, archive_after_days, purge_after_days) VALUES
  ('audit_logs', 30, 180, 365, 730),
  ('order_events', 30, 90, 365, 730),
  ('analytics_events', 7, 30, 90, 365),
  ('notification_logs', 14, 60, 180, 365),
  ('tracking_points', 7, 30, 90, 180),
  ('ledger_entries', 30, 365, 730, 0), -- never purge
  ('orders', 90, 365, 730, 0);

-- ═══════════════════════════════════════════════════════════════
-- 24. DEFAULT FEATURE FLAGS
-- ═══════════════════════════════════════════════════════════════
INSERT INTO feature_flags (key, enabled, description) VALUES
  ('ai_analytics', true, 'AI-powered analytics dashboard'),
  ('ai_anomaly_detection', true, 'Anomaly detection on orders/revenue'),
  ('ai_fraud_detection', true, 'Real-time fraud scoring'),
  ('ai_recommendations', true, 'Product recommendation engine'),
  ('ai_chatbot', true, 'WhatsApp AI chatbot'),
  ('ai_admin_intelligence', true, 'AI admin insights and suggestions'),
  ('whatsapp_viral', true, 'WhatsApp viral engine'),
  ('franchise_module', true, 'Franchise management'),
  ('pos_module', true, 'Point of sale'),
  ('delivery_60min', true, '60-minute delivery engine'),
  ('multi_store', true, 'Multi-store management'),
  ('advanced_crm', true, 'Advanced CRM with tiers'),
  ('data_lifecycle', true, 'Data lifecycle management'),
  ('ultra_security', false, 'SOC2 ultra hardening mode');
