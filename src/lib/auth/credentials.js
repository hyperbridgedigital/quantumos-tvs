// HyperBridge QuantumOS — Admin Credentials Store
// Production: migrate to bcrypt hashed passwords in Supabase

export const ADMIN_CREDENTIALS = {
  'spadensilver@gmail.com': { pass: 'Super@4455', role: 'superadmin', name: 'KR · Super Admin', store: 'all' },
  'master@charminarmehfil.com': { pass: 'Super@4455', role: 'superadmin', name: 'Master Admin', store: 'all' },
  'admin@mehfil.com':       { pass: 'Admin@123', role: 'admin',      name: 'Admin',          store: 'all' },
  'manager@mehfil.com':     { pass: 'Manager@1', role: 'manager',    name: 'Store Manager',  store: 'all' },
  'franchise@mehfil.com':   { pass: 'Franch@1',  role: 'franchise',  name: 'Franchise Ops',  store: 'ST001' },
};

export const ROLE_CONFIG = {
  superadmin: { label: 'Super Admin', emoji: '👑', level: 100, tabs: 'all' },
  admin:      { label: 'Admin',       emoji: '🔑', level: 80,  tabs: 'all' },
  manager:    { label: 'Manager',     emoji: '📊', level: 50,  tabs: ['dashboard','orders','stores','delivery','stock','pos','crm','cms','promo'] },
  franchise:  { label: 'Franchise',   emoji: '🏢', level: 20,  tabs: ['dashboard','orders','pos','stock'] },
  staff:      { label: 'Staff',       emoji: '👤', level: 10,  tabs: ['orders','pos'] },
  customer:   { label: 'Customer',    emoji: '🛒', level: 0,   tabs: [] },
};
