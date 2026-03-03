-- ═══════════════════════════════════════════
-- QuantumOS Charminar Mehfil — Supabase Schema
-- v1.2.0 | Single-File Migration
-- ═══════════════════════════════════════════

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ═══ STORES ═══
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  address TEXT,
  city TEXT DEFAULT 'Hyderabad',
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  phone TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','inactive','maintenance')),
  max_orders INT DEFAULT 50,
  delivery_radius_km NUMERIC(4,1) DEFAULT 8.0,
  operating_hours JSONB DEFAULT '{"open":"10:00","close":"23:00"}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ CATEGORIES ═══
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ PRODUCTS (Menu Items) ═══
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  compare_price NUMERIC(10,2),
  category_id UUID REFERENCES categories(id),
  image_url TEXT,
  is_veg BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  nutrition JSONB,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ CUSTOMERS ═══
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  phone TEXT UNIQUE,
  email TEXT,
  tier TEXT DEFAULT 'Bronze' CHECK (tier IN ('Bronze','Silver','Gold','Platinum')),
  loyalty_points INT DEFAULT 0,
  total_orders INT DEFAULT 0,
  ltv NUMERIC(10,2) DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  last_order_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ ORDERS ═══
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number SERIAL,
  customer_id UUID REFERENCES customers(id),
  store_id UUID REFERENCES stores(id),
  items JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax NUMERIC(10,2) DEFAULT 0,
  delivery_fee NUMERIC(10,2) DEFAULT 0,
  discount NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed','preparing','ready','out_for_delivery','delivered','cancelled')),
  payment_method TEXT DEFAULT 'cod' CHECK (payment_method IN ('cod','upi','card','wallet')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','refunded')),
  delivery_address JSONB,
  delivery_partner_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ STOCK / INVENTORY ═══
CREATE TABLE IF NOT EXISTS stock_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  qty NUMERIC(10,2) NOT NULL DEFAULT 0,
  unit TEXT DEFAULT 'kg',
  reorder_level NUMERIC(10,2) DEFAULT 10,
  cost_per_unit NUMERIC(10,2),
  supplier TEXT,
  store_id UUID REFERENCES stores(id),
  last_restocked TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ DELIVERY PARTNERS ═══
CREATE TABLE IF NOT EXISTS delivery_partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  vehicle_type TEXT DEFAULT 'bike',
  status TEXT DEFAULT 'available' CHECK (status IN ('available','busy','offline')),
  current_lat DOUBLE PRECISION,
  current_lng DOUBLE PRECISION,
  total_deliveries INT DEFAULT 0,
  rating NUMERIC(2,1) DEFAULT 5.0,
  store_id UUID REFERENCES stores(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ DELIVERY ZONES ═══
CREATE TABLE IF NOT EXISTS delivery_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id),
  pincode TEXT NOT NULL,
  area_name TEXT,
  delivery_fee NUMERIC(10,2) DEFAULT 30,
  min_order NUMERIC(10,2) DEFAULT 199,
  est_minutes INT DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(store_id, pincode)
);

-- ═══ WHATSAPP TEMPLATES ═══
CREATE TABLE IF NOT EXISTS wa_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  template TEXT NOT NULL,
  category TEXT DEFAULT 'utility',
  variables TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ FRANCHISES ═══
CREATE TABLE IF NOT EXISTS franchises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  investment_range TEXT,
  experience TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','contacted','approved','rejected')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ SETTINGS ═══
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  group_name TEXT DEFAULT 'general',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ AUDIT LOG ═══
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ AI PREDICTIONS (Kynetra) ═══
CREATE TABLE IF NOT EXISTS ai_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  prediction JSONB NOT NULL,
  confidence NUMERIC(3,2),
  actual JSONB,
  store_id UUID REFERENCES stores(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ AI ANOMALIES (Kynetra) ═══
CREATE TABLE IF NOT EXISTS ai_anomalies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  description TEXT NOT NULL,
  data JSONB,
  resolved BOOLEAN DEFAULT false,
  resolved_by TEXT,
  store_id UUID REFERENCES stores(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ INDEXES ═══
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_store ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(is_available);
CREATE INDEX IF NOT EXISTS idx_stock_store ON stock_items(store_id);
CREATE INDEX IF NOT EXISTS idx_stock_sku ON stock_items(sku);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_tier ON customers(tier);
CREATE INDEX IF NOT EXISTS idx_delivery_zones_pincode ON delivery_zones(pincode);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_anomalies_type ON ai_anomalies(type);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_type ON ai_predictions(type);

-- ═══ ROW LEVEL SECURITY ═══
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Service role can access everything
CREATE POLICY "Service role full access" ON stores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON stock_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON audit_log FOR ALL USING (true) WITH CHECK (true);

-- ═══ UPDATED_AT TRIGGER ═══
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER stores_updated_at BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
