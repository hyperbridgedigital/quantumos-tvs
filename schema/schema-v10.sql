-- ═══════════════════════════════════════════════════════════
-- CHARMINAR MEHFIL v10 — COMPLETE DATABASE SCHEMA
-- Supabase Postgres + RLS
-- ═══════════════════════════════════════════════════════════

-- STORES
CREATE TABLE stores (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  type TEXT DEFAULT 'express',
  status TEXT DEFAULT 'active',
  address TEXT,
  lat DECIMAL(10,6),
  lng DECIMAL(10,6),
  phone TEXT,
  manager TEXT,
  operating_hours JSONB,
  delivery_radius INTEGER DEFAULT 5,
  avg_prep_time INTEGER DEFAULT 20,
  max_orders INTEGER DEFAULT 50,
  current_load INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0,
  delivery_enabled BOOLEAN DEFAULT true,
  pickup_enabled BOOLEAN DEFAULT true,
  dine_in_enabled BOOLEAN DEFAULT false,
  seating INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DELIVERY ZONES
CREATE TABLE delivery_zones (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  store_id TEXT REFERENCES stores(id),
  polygon JSONB,
  delivery_fee INTEGER DEFAULT 0,
  min_order INTEGER DEFAULT 0,
  max_delivery_time INTEGER DEFAULT 30,
  surge_multiplier DECIMAL(3,2) DEFAULT 1.0,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 1
);

-- DELIVERY PARTNERS
CREATE TABLE delivery_partners (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE,
  vehicle TEXT DEFAULT 'bike',
  status TEXT DEFAULT 'offline',
  current_lat DECIMAL(10,6),
  current_lng DECIMAL(10,6),
  active_orders INTEGER DEFAULT 0,
  max_orders INTEGER DEFAULT 3,
  rating DECIMAL(2,1) DEFAULT 0,
  store_id TEXT REFERENCES stores(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDERS
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  store_id TEXT REFERENCES stores(id),
  items JSONB NOT NULL,
  total INTEGER NOT NULL,
  status TEXT DEFAULT 'confirmed',
  type TEXT DEFAULT 'delivery',
  payment_method TEXT DEFAULT 'cod',
  payment_status TEXT DEFAULT 'pending',
  delivery_partner_id TEXT REFERENCES delivery_partners(id),
  delivery_address TEXT,
  eta_minutes INTEGER,
  placed_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  notes TEXT
);

-- STOCK / WMS
CREATE TABLE stock_items (
  sku TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  store_id TEXT REFERENCES stores(id),
  quantity INTEGER DEFAULT 0,
  reorder_level INTEGER DEFAULT 10,
  unit TEXT DEFAULT 'pcs',
  cost_per_unit INTEGER DEFAULT 0,
  supplier TEXT,
  last_restocked TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FRANCHISES
CREATE TABLE franchises (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  status TEXT DEFAULT 'setup',
  city TEXT,
  revenue INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  royalty_pct INTEGER DEFAULT 12,
  investment INTEGER DEFAULT 0,
  since DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- WHATSAPP TEMPLATES
CREATE TABLE wa_templates (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending',
  category TEXT DEFAULT 'UTILITY',
  language TEXT DEFAULT 'en',
  body TEXT NOT NULL,
  param_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CRM CUSTOMERS
CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  total_orders INTEGER DEFAULT 0,
  ltv INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'Bronze',
  tags TEXT[] DEFAULT '{}',
  last_order_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PARTNER CONFIG (Admin configurable IDs)
CREATE TABLE partner_config (
  key TEXT PRIMARY KEY,
  value TEXT DEFAULT '',
  partner TEXT NOT NULL,
  label TEXT NOT NULL,
  type TEXT DEFAULT 'text',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT
);

-- SETTINGS
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  label TEXT,
  type TEXT DEFAULT 'text',
  section TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AUDIT LOG
CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  user_id TEXT,
  user_role TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- INDEXES
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_store ON orders(store_id);
CREATE INDEX idx_orders_placed ON orders(placed_at DESC);
CREATE INDEX idx_stock_store ON stock_items(store_id);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);
