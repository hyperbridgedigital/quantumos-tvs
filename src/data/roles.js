// Roles & Tabs — v11.3.0 — Grouped Admin Navigation
export const ROLES = {
  superadmin: { label:'Super Admin', emoji:'👑', color:'#C9A84C', tabs:['all'] },
  admin: { label:'Admin', emoji:'🔑', color:'#3B82F6', tabs:['all'] },
  manager: { label:'Manager', emoji:'👔', color:'#22C55E', tabs:['dashboard','orders','stores','delivery','stock','pos','crm','cms','promo','whatsapp'] },
  franchise: { label:'Franchise Owner', emoji:'🏪', color:'#8B5CF6', tabs:['dashboard','orders','pos','stock'] },
  staff: { label:'Staff', emoji:'👤', color:'#06B6D4', tabs:['orders','pos'] },
};

// Grouped sidebar structure
export const SIDEBAR_GROUPS = [
  {
    key: 'command', label: 'COMMAND CENTER', icon: '⚡',
    tabs: [
      { key:'dashboard', label:'Dashboard', emoji:'📊' },
    ],
  },
  {
    key: 'sales', label: 'SALES & ORDERS', icon: '💰',
    tabs: [
      { key:'orders', label:'Orders (OMS)', emoji:'📦' },
      { key:'pos', label:'Point of Sale', emoji:'🧾' },
      { key:'delivery', label:'Delivery Ops', emoji:'🚀' },
      { key:'pincodes', label:'Pincodes', emoji:'📍' },
    ],
  },
  {
    key: 'marketing', label: 'MARKETING & GROWTH', icon: '📣',
    tabs: [
      { key:'promo', label:'Promo Engine', emoji:'🎯' },
      { key:'whatsapp', label:'WhatsApp CRM', emoji:'💬' },
      { key:'marketing', label:'Campaigns', emoji:'📣' },
      { key:'remarketing', label:'Audiences', emoji:'🎯' },
      { key:'funnels', label:'Funnel Builder', emoji:'🔄' },
      { key:'rewards', label:'Loyalty', emoji:'🏆' },
    ],
  },
  {
    key: 'customers', label: 'CUSTOMERS & CRM', icon: '👥',
    tabs: [
      { key:'crm', label:'CRM', emoji:'👥' },
      { key:'commhub', label:'Comm Hub', emoji:'📡' },
      { key:'automation', label:'Automation', emoji:'🤖' },
    ],
  },
  {
    key: 'operations', label: 'OPERATIONS', icon: '🏪',
    tabs: [
      { key:'stores', label:'Stores', emoji:'🏪' },
      { key:'stock', label:'Stock/WMS', emoji:'📦' },
      { key:'franchise', label:'Franchise', emoji:'🏢' },
      { key:'partners', label:'Partners/Keys', emoji:'🔑' },
    ],
  },
  {
    key: 'content', label: 'CONTENT & SEO', icon: '📝',
    tabs: [
      { key:'cms', label:'CMS', emoji:'📝' },
      { key:'seo', label:'SEO & Geo', emoji:'🌐' },
    ],
  },
  {
    key: 'intelligence', label: 'AI & ANALYTICS', icon: '🧠',
    tabs: [
      { key:'ai', label:'AI Center', emoji:'🧠' },
      { key:'eventlog', label:'Event Log', emoji:'📋' },
    ],
  },
  {
    key: 'system', label: 'SYSTEM', icon: '⚙️',
    tabs: [
      { key:'security', label:'Security', emoji:'🔒' },
      { key:'data', label:'Data Lifecycle', emoji:'🗄' },
      { key:'rbac', label:'RBAC', emoji:'🛡' },
      { key:'settings', label:'Settings', emoji:'⚙️' },
    ],
  },
];

// Flat list for backwards compatibility
export const ADMIN_TABS = SIDEBAR_GROUPS.flatMap(g => g.tabs);

export const DEMO_USERS = {
  superadmin: { name:'Spaden Silver', email:'spadensilver@gmail.com', role:'superadmin' },
  admin: { name:'Admin User', email:'admin@mehfil.com', role:'admin' },
  manager: { name:'Store Manager', email:'manager@mehfil.com', role:'manager' },
  franchise: { name:'Franchise Owner', email:'franchise@mehfil.com', role:'franchise' },
};
