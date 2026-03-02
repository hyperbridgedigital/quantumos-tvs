'use client';
import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { stores as storeData } from '@/data/stores';
import { sampleOrders } from '@/data/orders';
import { stockItems as stockData } from '@/data/stock';
import { franchises as franchiseData } from '@/data/franchise';
import { deliveryPartners as dpData, deliveryZones as zoneData } from '@/data/delivery';
import { customers as crmData } from '@/data/crm';
import { waTemplates as tplData, viralCampaigns as viralData } from '@/data/whatsapp';
import { offersConfig as offersData, rewardsConfig as rewardsData } from '@/data/offers';
import { menuItems as menuData } from '@/data/products';
import { partnerConfig, getPartnerDefaults } from '@/data/partners';
import { ROLES as roleData, ADMIN_TABS, DEMO_USERS } from '@/data/roles';
import { getDefaultSettings } from '@/data/settings';
import { remarketingRecords as rmData } from '@/data/remarketingDb';
import { uid, fmt } from '@/lib/utils';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // ═══ AUTH & VIEW ═══
  const [view, setView] = useState('store');
  const [user, setUser] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [adminTab, setAdminTab] = useState('dashboard');
  const [showUserAuth, setShowUserAuth] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  // ═══ CORE DATA ═══
  const [stores, setStores] = useState(storeData);
  const [orders, setOrders] = useState(sampleOrders);
  const [stock, setStock] = useState(stockData || []);
  const [franchises, setFranchises] = useState(franchiseData);
  const [deliveryPartners, setDeliveryPartners] = useState(dpData);
  const [deliveryZones, setDeliveryZones] = useState(zoneData);
  const [customers, setCustomers] = useState(crmData);
  const [waTemplates, setWaTemplates] = useState(tplData);
  const [viralCampaigns, setViralCampaigns] = useState(viralData);
  const [offers, setOffers] = useState(offersData);
  const [rewardsConf] = useState(rewardsData);
  const [userLocation, setUserLocation] = useState(null);
  const [products, setProducts] = useState(menuData);
  const [partnerValues, setPartnerValues] = useState(getPartnerDefaults);
  const [roles, setRoles] = useState(roleData);
  const [settings, setSettings] = useState(getDefaultSettings);
  const [selectedStore, setSelectedStore] = useState('ST001');
  const [cart, setCart] = useState([]);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [remarketingRecords, setRemarketingRecords] = useState(rmData);

  // ═══ NEW STATE: Funnels, Automation Rules, Chatbot ═══
  const [funnels, setFunnels] = useState([
    { id:'FNL01', name:'New Customer Welcome', stages:['Visit','Sign Up','First Order','Repeat Order','Loyal'], counts:[1200,340,180,85,42], active:true, campaign:'WELCOME20', channel:'whatsapp' },
    { id:'FNL02', name:'Lapsed Customer Win-Back', stages:['Inactive 30d','Email Sent','Opened','Clicked','Re-ordered'], counts:[560,480,210,95,38], active:true, campaign:'COMEBACK', channel:'email' },
    { id:'FNL03', name:'Franchise Inquiry', stages:['Landing Page','Form Fill','Call Scheduled','Meeting','Signed'], counts:[890,120,45,18,6], active:true, campaign:'FRANCHISE', channel:'sms' },
    { id:'FNL04', name:'Festival Campaign', stages:['Ad Seen','Site Visit','Add to Cart','Order','Upsell'], counts:[5000,1800,600,280,120], active:false, campaign:'FESTIVE50', channel:'whatsapp' },
  ]);
  const [automationRules, setAutomationRules] = useState([
    { id:'AR01', name:'Welcome New Customer', trigger:'customer_signup', condition:'first_order=false', action:'send_whatsapp', template:'welcome_offer', delay:'0h', active:true, fired:1240, converted:380 },
    { id:'AR02', name:'Cart Abandonment', trigger:'cart_abandoned', condition:'cart_value>299', action:'send_whatsapp', template:'cart_reminder', delay:'1h', active:true, fired:890, converted:210 },
    { id:'AR03', name:'Re-engage Lapsed', trigger:'no_order_30d', condition:'ltv>500', action:'send_email', template:'comeback_offer', delay:'0h', active:true, fired:560, converted:95 },
    { id:'AR04', name:'Birthday Offer', trigger:'birthday_today', condition:'tier!=Bronze', action:'send_whatsapp', template:'birthday_treat', delay:'9am', active:true, fired:145, converted:68 },
    { id:'AR05', name:'Low Stock Alert', trigger:'stock_below_reorder', condition:'any', action:'notify_admin', template:'low_stock_alert', delay:'0h', active:true, fired:320, converted:320 },
    { id:'AR06', name:'Order Delivered → Review', trigger:'order_delivered', condition:'delivery_time<45min', action:'send_whatsapp', template:'review_request', delay:'2h', active:false, fired:2100, converted:380 },
    { id:'AR07', name:'Upsell After Order', trigger:'order_placed', condition:'order_value<499', action:'send_whatsapp', template:'upsell_dessert', delay:'10min', active:true, fired:1560, converted:280 },
    { id:'AR08', name:'VIP Tier Upgrade', trigger:'ltv_milestone', condition:'ltv>5000', action:'send_whatsapp', template:'vip_welcome', delay:'0h', active:true, fired:42, converted:42 },
  ]);
  const [chatbotFlows, setChatbotFlows] = useState([
    { id:'BOT01', name:'Order Flow', trigger:'order|menu|food|biryani', steps:['Show Menu','Select Items','Confirm Order','Payment Link','Track Order'], active:true, conversations:2340 },
    { id:'BOT02', name:'Track Order', trigger:'track|status|where|delivery', steps:['Ask Order ID','Fetch Status','Show ETA','Live Map Link'], active:true, conversations:1890 },
    { id:'BOT03', name:'Complaint', trigger:'complaint|issue|problem|wrong', steps:['Apologize','Ask Order ID','Log Ticket','Assign Agent','Follow Up'], active:true, conversations:340 },
    { id:'BOT04', name:'Franchise Inquiry', trigger:'franchise|own|invest|business', steps:['Share Info','Collect Name/Phone','Book Call','Send Brochure'], active:true, conversations:120 },
    { id:'BOT05', name:'Promo/Offer', trigger:'offer|discount|deal|coupon', steps:['List Active Promos','Apply Code','Generate Link','Confirm'], active:true, conversations:780 },
  ]);
  const [chatMessages, setChatMessages] = useState([
    { id:1, from:'customer', name:'Ravi K', phone:'+919876543210', msg:'Hi, I want to order biryani', time:'2m ago', bot:'BOT01', status:'active' },
    { id:2, from:'bot', name:'Bot', msg:'Welcome to Charminar Mehfil! 🍗 Here is our menu...', time:'2m ago', bot:'BOT01', status:'active' },
    { id:3, from:'customer', name:'Priya S', phone:'+919988776655', msg:'Where is my order ORD-7X2?', time:'8m ago', bot:'BOT02', status:'resolved' },
    { id:4, from:'customer', name:'Ahmed J', phone:'+919112233445', msg:'I want to open a franchise', time:'15m ago', bot:'BOT04', status:'escalated' },
  ]);

  // ═══ TOAST ═══
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  // ═══ AUTH (Backend API) ═══
  const [authToken, setAuthToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Restore session on mount — auto-login super admin for demo
  useEffect(() => {
    (async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('qos_token') : null;
        if (token) {
          const res = await fetch('/api/auth/session', { headers: { Authorization: 'Bearer ' + token } });
          const data = await res.json();
          if (data.ok && data.user) {
            setAuthToken(token);
            const u = DEMO_USERS[data.user.role] || { id: data.user.id, name: data.user.name, role: data.user.role, email: data.user.email };
            setUser(u); setView('admin'); setAdminTab('dashboard');
            return;
          }
          localStorage.removeItem('qos_token');
        }
        // Auto-login as Super Admin for demo
        const res = await fetch('/api/auth/login', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'spadensilver@gmail.com', password: 'Admin@123' }),
        });
        const data = await res.json();
        if (data.ok) {
          setAuthToken(data.accessToken);
          if (typeof window !== 'undefined') localStorage.setItem('qos_token', data.accessToken);
          const u = DEMO_USERS[data.user.role] || { id: data.user.email, name: data.user.name, role: data.user.role, email: data.user.email };
          setUser(u); setView('admin'); setAdminTab('dashboard');
        }
      } catch (e) { console.warn('Session init:', e); }
    })();
  }, []);

  const adminLogin = useCallback(async (email, password) => {
    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.ok) { setAuthLoading(false); return data; }
      setAuthToken(data.accessToken);
      if (typeof window !== 'undefined') localStorage.setItem('qos_token', data.accessToken);
      const u = DEMO_USERS[data.user.role] || { id: data.user.email, name: data.user.name, role: data.user.role, email: data.user.email };
      setUser(u); setView('admin'); setAdminTab('dashboard'); setShowAdminLogin(false);
      show('Welcome back, ' + data.user.name);
      setAuthLoading(false);
      return { ok: true, user: data.user };
    } catch (e) { setAuthLoading(false); return { ok: false, error: 'Network error: ' + e.message }; }
  }, [show]);

  const adminLogout = useCallback(async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch (e) {}
    setAuthToken(null); setUser(null); setView('store'); setAdminTab('dashboard');
    if (typeof window !== 'undefined') localStorage.removeItem('qos_token');
    show('Logged out');
  }, [show]);

  const userSendOTP = useCallback(async (target, channel = 'sms') => {
    if (!target) return { ok: false, error: 'Enter phone or email' };
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, channel }),
      });
      const data = await res.json();
      if (data.ok) {
        const channelLabels = { sms: 'SMS', whatsapp: 'WhatsApp', email: 'Email' };
        show('OTP sent via ' + channelLabels[channel] + ' to ' + target);
      }
      return data;
    } catch (e) { return { ok: false, error: 'Network error: ' + e.message }; }
  }, [show]);

  const userVerifyOTP = useCallback(async (target, otp, name, channel = 'sms') => {
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, otp, channel, name, loginType: 'customer' }),
      });
      const data = await res.json();
      if (!data.ok) return data;
      setAuthToken(data.accessToken);
      if (typeof window !== 'undefined') localStorage.setItem('qos_token', data.accessToken);
      const isEmail = channel === 'email';
      const existing = customers.find(c => isEmail ? c.email === target : c.phone === target);
      const cust = existing || {
        id: data.user.id || ('C' + uid()), name: name || 'Customer',
        phone: isEmail ? '' : target, email: isEmail ? target : '',
        orders: 0, ltv: 0, tier: 'Bronze', lastOrder: 'never', mood: '😊',
        joined: new Date().toISOString().slice(0, 7), tags: ['new'],
      };
      if (!existing) setCustomers(p => [...p, cust]);
      setCustomer(cust); setShowUserAuth(false);
      show('Welcome, ' + cust.name + '!');
      return { ok: true, customer: cust };
    } catch (e) { return { ok: false, error: 'Network error: ' + e.message }; }
  }, [customers, show]);

  const userLogout = useCallback(async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch (e) {}
    setCustomer(null); setAuthToken(null);
    if (typeof window !== 'undefined') localStorage.removeItem('qos_token');
    show('Signed out');
  }, [show]);
  const login = adminLogin;
  const logout = adminLogout;

  // ═══ RBAC ═══
  const canAccess = useCallback((tab) => {
    if (!user) return false;
    const r = roles[user.role];
    return r?.tabs?.includes('all') || r?.tabs?.includes(tab);
  }, [user, roles]);
  const visibleTabs = useMemo(() => ADMIN_TABS.filter(t => canAccess(t.key)), [canAccess]);

  // ═══ STORE OPS ═══
  const addStore = useCallback((store) => {
    const s = { id: 'ST' + uid(), load: 0, rating: 0, zones: [], inventory: {}, ...store };
    setStores(p => [...p, s]); show('Store "' + s.name + '" added'); return s;
  }, [show]);
  const updateStore = useCallback((id, updates) => { setStores(p => p.map(s => s.id === id ? { ...s, ...updates } : s)); show('Store updated'); }, [show]);
  const deleteStore = useCallback((id) => { setStores(p => p.filter(s => s.id !== id)); show('Store removed'); }, [show]);

  // ═══ CRM OPS (Pipeline-integrated) ═══
  const updateCustomerFromOrder = useCallback((order) => {
    setCustomers(p => {
      const ex = p.find(c => c.phone === order.phone);
      if (ex) {
        return p.map(c => c.phone === order.phone ? {
          ...c, orders: c.orders + 1, ltv: c.ltv + order.total, lastOrder: 'just now',
          lastOrderDate: new Date().toISOString(),
          tier: (c.ltv + order.total) > 12000 ? 'Platinum' : (c.ltv + order.total) > 6000 ? 'Gold' : (c.ltv + order.total) > 2500 ? 'Silver' : 'Bronze',
          preferred_store: order.store || c.preferred_store,
          preferred_items: order.items ? [...new Set([...(c.preferred_items||[]), ...order.items.map(i=>i.name)])].slice(-5) : c.preferred_items,
        } : c);
      }
      return [...p, {
        id: 'C' + uid(), name: order.customer, phone: order.phone, email: '',
        orders: 1, ltv: order.total, tier: 'Bronze', lastOrder: 'just now',
        lastOrderDate: new Date().toISOString(),
        mood: '😊', joined: new Date().toISOString().slice(0, 7), tags: ['new'],
        preferred_store: order.store, preferred_items: order.items ? order.items.map(i=>i.name).slice(0,3) : [],
        consent_status: 'opted_in',
      }];
    });
    // Update remarketing DB
    setRemarketingRecords(p => {
      const ex = p.find(r => r.phone === order.phone);
      if (ex) {
        return p.map(r => {
          if (r.phone !== order.phone) return r;
          const cnt = r.order_count + 1;
          const ltv = r.ltv + order.total;
          return { ...r, ltv, order_count: cnt, avg_order_value: Math.round(ltv/cnt), last_order_date: new Date().toISOString(), tier: ltv > 12000 ? 'Platinum' : ltv > 6000 ? 'Gold' : ltv > 2500 ? 'Silver' : 'Bronze' };
        });
      }
      return [...p, {
        customer_id: 'RM-' + uid(), phone: order.phone, email: '', name: order.customer,
        ltv: order.total, tier: 'Bronze', tags: ['new'], last_order_date: new Date().toISOString(),
        order_count: 1, avg_order_value: order.total, preferred_items: order.items?.map(i=>i.name)||[],
        preferred_store: order.store, consent_status: 'opted_in', consent_log: [], platform_ids: {}, segments: ['new_customer'],
      }];
    });
  }, []);

  // ═══ ORDER OPS ═══
  const addOrder = useCallback((order) => {
    const o = { id: 'ORD-' + Date.now().toString().slice(-4), status: 'confirmed', placed: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }), placedDate: new Date().toISOString(), ...order };
    setOrders(p => [o, ...p]);
    if (o.store) setStores(p => p.map(s => s.id === o.store ? { ...s, load: s.load + 1 } : s));
    updateCustomerFromOrder(o);
    show('Order ' + o.id + ' created!');
    return o;
  }, [show, updateCustomerFromOrder]);

  const updateOrderStatus = useCallback((id, status) => {
    setOrders(p => p.map(o => {
      if (o.id !== id) return o;
      const updated = { ...o, status };
      if (status === 'delivered' && o.store) setStores(prev => prev.map(s => s.id === o.store ? { ...s, load: Math.max(0, s.load - 1) } : s));
      if (status === 'out_for_delivery' && !o.partner) {
        const available = deliveryPartners.find(d => d.status === 'available' && d.store === o.store);
        if (available) {
          updated.partner = available.id; updated.eta = available.avgTime;
          setDeliveryPartners(prev => prev.map(d => d.id === available.id ? { ...d, status: 'delivering', orders: d.orders + 1 } : d));
        }
      }
      if (status === 'delivered' && o.partner) setDeliveryPartners(prev => prev.map(d => d.id === o.partner ? { ...d, status: 'available', orders: Math.max(0, d.orders - 1), today: d.today + 1 } : d));
      return updated;
    }));
    show('Order ' + id + ' → ' + status.replace(/_/g, ' '));
  }, [show, deliveryPartners]);

  // ═══ STOCK OPS ═══
  const updateStock = useCallback((sku, updates) => { setStock(p => p.map(s => s.sku === sku ? { ...s, ...updates } : s)); show('Stock updated: ' + sku); }, [show]);
  const addStockItem = useCallback((item) => { const s = { sku: 'RAW-' + uid().toUpperCase(), ...item }; setStock(p => [...p, s]); show('Stock item added'); return s; }, [show]);
  const deleteStockItem = useCallback((sku) => { setStock(p => p.filter(s => s.sku !== sku)); show('Stock item removed'); }, [show]);

  // ═══ DELIVERY OPS ═══
  const updatePartnerStatus = useCallback((id, status) => { setDeliveryPartners(p => p.map(d => d.id === id ? { ...d, status } : d)); show('Partner ' + id + ' → ' + status); }, [show]);
  const addDeliveryPartner = useCallback((partner) => { const p = { id: 'DP' + uid(), orders: 0, today: 0, avgTime: 20, rating: 4.5, ...partner }; setDeliveryPartners(prev => [...prev, p]); show('Delivery partner added'); return p; }, [show]);
  const updateZone = useCallback((id, updates) => { setDeliveryZones(p => p.map(z => z.id === id ? { ...z, ...updates } : z)); show('Zone updated'); }, [show]);
  const addZone = useCallback((zone) => { const z = { id: 'Z' + uid(), active: true, ...zone }; setDeliveryZones(p => [...p, z]); show('Zone added'); return z; }, [show]);

  // ═══ FRANCHISE OPS ═══
  const addFranchise = useCallback((f) => { const fr = { id: 'FR' + uid(), revenue: 0, orders: 0, since: new Date().toISOString().slice(0, 7), ...f }; setFranchises(p => [...p, fr]); show('Franchise added'); return fr; }, [show]);
  const updateFranchise = useCallback((id, updates) => { setFranchises(p => p.map(f => f.id === id ? { ...f, ...updates } : f)); show('Franchise updated'); }, [show]);

  // ═══ WHATSAPP OPS ═══
  const updateWaTemplate = useCallback((id, updates) => { setWaTemplates(p => p.map(t => t.id === id ? { ...t, ...updates } : t)); show('Template updated'); }, [show]);
  const addWaTemplate = useCallback((tpl) => { const t = { id: 'TPL' + uid(), status: 'pending', sent: 0, lang: 'en', ...tpl }; setWaTemplates(p => [...p, t]); show('Template created'); return t; }, [show]);
  const toggleViralCampaign = useCallback((name) => { setViralCampaigns(p => p.map(c => c.name === name ? { ...c, active: !c.active } : c)); }, []);

  // ═══ PRODUCT OPS ═══
  const addProduct = useCallback((p) => { const prod = { id: 'P' + uid(), sku: 'CM-' + uid().toUpperCase(), ...p }; setProducts(prev => [...prev, prod]); show('Product added'); return prod; }, [show]);
  const updateProduct = useCallback((id, updates) => { setProducts(p => p.map(pr => pr.id === id ? { ...pr, ...updates } : pr)); show('Product updated'); }, [show]);
  const deleteProduct = useCallback((id) => { setProducts(p => p.filter(pr => pr.id !== id)); show('Product removed'); }, [show]);

  // ═══ RBAC OPS ═══
  const toggleRoleTab = useCallback((role, tab) => {
    setRoles(p => { const r = { ...p[role] }; if (r.tabs.includes('all')) return p; r.tabs = r.tabs.includes(tab) ? r.tabs.filter(t => t !== tab) : [...r.tabs, tab]; return { ...p, [role]: r }; });
  }, []);

  // ═══ SETTINGS OPS ═══
  const updateSetting = useCallback((key, value) => { setSettings(p => ({ ...p, [key]: value })); }, []);
  const saveSettings = useCallback(() => { show('All settings saved!'); }, [show]);
  const updatePartnerConfig = useCallback((key, value) => { setPartnerValues(p => ({ ...p, [key]: value })); }, []);
  const savePartnerConfig = useCallback(() => { show('All partner configurations saved!'); }, [show]);

  // ═══ OFFER/PROMO OPS ═══
  const addOffer = useCallback((o) => { const offer = { id:'OFF'+uid(), used:0, active:true, icon:'🎁', color:'#22C55E', ...o }; setOffers(p => [...p, offer]); show('Promo created'); return offer; }, [show]);
  const updateOffer = useCallback((id, updates) => { setOffers(p => p.map(o => o.id === id ? { ...o, ...updates } : o)); show('Promo updated'); }, [show]);
  const deleteOffer = useCallback((id) => { setOffers(p => p.filter(o => o.id !== id)); show('Promo deleted'); }, [show]);

  // ═══ CUSTOMER OPS ═══
  const updateCustomer = useCallback((id, updates) => { setCustomers(p => p.map(c => c.id === id ? { ...c, ...updates } : c)); show('Customer updated'); }, [show]);
  const addCustomerTag = useCallback((id, tag) => { setCustomers(p => p.map(c => c.id === id ? { ...c, tags: [...new Set([...c.tags, tag])] } : c)); }, []);
  const removeCustomerTag = useCallback((id, tag) => { setCustomers(p => p.map(c => c.id === id ? { ...c, tags: c.tags.filter(t => t !== tag) } : c)); }, []);

  // ═══ FUNNEL OPS ═══
  const addFunnel = useCallback((f) => { const fn = { id:'FNL'+uid(), stages:['Visit','Action','Convert'], counts:[0,0,0], active:true, ...f }; setFunnels(p => [...p, fn]); show('Funnel created'); return fn; }, [show]);
  const updateFunnel = useCallback((id, updates) => { setFunnels(p => p.map(f => f.id === id ? { ...f, ...updates } : f)); show('Funnel updated'); }, [show]);
  const deleteFunnel = useCallback((id) => { setFunnels(p => p.filter(f => f.id !== id)); show('Funnel deleted'); }, [show]);

  // ═══ AUTOMATION OPS ═══
  const addRule = useCallback((r) => { const rule = { id:'AR'+uid(), fired:0, converted:0, active:true, ...r }; setAutomationRules(p => [...p, rule]); show('Rule created'); return rule; }, [show]);
  const updateRule = useCallback((id, updates) => { setAutomationRules(p => p.map(r => r.id === id ? { ...r, ...updates } : r)); show('Rule updated'); }, [show]);
  const deleteRule = useCallback((id) => { setAutomationRules(p => p.filter(r => r.id !== id)); show('Rule deleted'); }, [show]);
  const toggleRule = useCallback((id) => { setAutomationRules(p => p.map(r => r.id === id ? { ...r, active: !r.active } : r)); }, []);

  // ═══ CHATBOT OPS ═══
  const addBotFlow = useCallback((f) => { const flow = { id:'BOT'+uid(), conversations:0, active:true, ...f }; setChatbotFlows(p => [...p, flow]); show('Bot flow created'); return flow; }, [show]);
  const updateBotFlow = useCallback((id, updates) => { setChatbotFlows(p => p.map(f => f.id === id ? { ...f, ...updates } : f)); show('Bot flow updated'); }, [show]);
  const addChatMessage = useCallback((msg) => { setChatMessages(p => [{ id: Date.now(), time:'just now', ...msg }, ...p]); }, []);

  // ═══ CART / STOREFRONT OPS ═══
  const addToCart = useCallback((item) => { setCart(p => { const ex = p.find(i => i.id === item.id); if (ex) return p.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i); return [...p, { ...item, qty: 1 }]; }); }, []);
  const removeFromCart = useCallback((id) => { setCart(p => p.filter(i => i.id !== id)); }, []);
  const updateCartQty = useCallback((id, qty) => { if (qty <= 0) return setCart(p => p.filter(i => i.id !== id)); setCart(p => p.map(i => i.id === id ? { ...i, qty } : i)); }, []);

  const placeOrder = useCallback((customerInfo) => {
    if (cart.length === 0) return show('Cart is empty', 'error');
    const total = cart.reduce((a, i) => a + i.price * i.qty, 0);
    const gst = Math.round(total * (Number(settings.GST_RATE) || 5) / 100);
    const store = stores.find(s => s.id === selectedStore);
    const zone = deliveryZones.find(z => z.store === selectedStore && z.active);
    const deliveryFee = total >= Number(settings.DELIVERY_FREE_ABOVE || 299) ? 0 : (zone?.fee || 30);
    const order = addOrder({
      customer: customerInfo.name || 'Walk-in Customer', phone: customerInfo.phone || '+91 00000 00000',
      store: selectedStore, items: cart.map(i => ({ name: i.name, qty: i.qty, price: i.price })),
      total: total + gst + deliveryFee, subtotal: total, gst, deliveryFee,
      type: customerInfo.type || 'delivery', address: customerInfo.address || store?.address || '',
      partner: null, eta: (store?.prepTime || 20) + 20,
    });
    cart.forEach(item => { const si = stock.find(s => s.name?.toLowerCase().includes(item.name.toLowerCase().split(' ')[0])); if (si) updateStock(si.sku, { qty: Math.max(0, si.qty - item.qty) }); });
    setCart([]); setCustomerOrders(p => [order, ...p]);
    return order;
  }, [cart, selectedStore, settings, stores, deliveryZones, stock, addOrder, updateStock, show]);

  // ═══ DERIVED DATA ═══
  const activeStores = useMemo(() => stores.filter(s => s.status === 'active'), [stores]);
  const currentStore = useMemo(() => stores.find(s => s.id === selectedStore), [stores, selectedStore]);
  const storeZones = useMemo(() => deliveryZones.filter(z => z.store === selectedStore && z.active), [deliveryZones, selectedStore]);
  const lowStock = useMemo(() => stock.filter(s => s.qty <= (s.reorder || 10)), [stock]);
  const liveOrders = useMemo(() => orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled'), [orders]);
  const cartTotal = useMemo(() => cart.reduce((a, i) => a + i.price * i.qty, 0), [cart]);
  const availableProducts = useMemo(() => products.map(p => { const inStock = stock.find(s => s.name?.toLowerCase().includes(p.name.toLowerCase().split(' ')[0])); return { ...p, available: !inStock || inStock.qty > 0 }; }), [products, stock]);

  const value = useMemo(() => ({
    view, setView, user, customer, login, logout,
    adminLogin, adminLogout, userSendOTP, userVerifyOTP, userLogout,
    showUserAuth, setShowUserAuth, showAdminLogin, setShowAdminLogin,
    adminTab, setAdminTab, canAccess, visibleTabs, toast, show,
    stores, setStores, addStore, updateStore, deleteStore, activeStores, currentStore, selectedStore, setSelectedStore,
    orders, setOrders, addOrder, updateOrderStatus, liveOrders, customerOrders,
    stock, setStock, updateStock, addStockItem, deleteStockItem, lowStock,
    deliveryPartners, setDeliveryPartners, updatePartnerStatus, addDeliveryPartner,
    deliveryZones, setDeliveryZones, updateZone, addZone, storeZones,
    franchises, setFranchises, addFranchise, updateFranchise,
    waTemplates, setWaTemplates, updateWaTemplate, addWaTemplate, viralCampaigns, toggleViralCampaign,
    offers, setOffers, addOffer, updateOffer, deleteOffer, rewardsConf, userLocation, setUserLocation,
    customers, setCustomers, updateCustomer, addCustomerTag, removeCustomerTag,
    products, setProducts, addProduct, updateProduct, deleteProduct, availableProducts,
    partnerValues, updatePartnerConfig, savePartnerConfig, partnerConfig,
    roles, toggleRoleTab, settings, updateSetting, saveSettings,
    cart, addToCart, removeFromCart, updateCartQty, placeOrder, cartTotal,
    remarketingRecords, setRemarketingRecords,
    funnels, addFunnel, updateFunnel, deleteFunnel,
    automationRules, addRule, updateRule, deleteRule, toggleRule,
    chatbotFlows, addBotFlow, updateBotFlow, chatMessages, addChatMessage,
  }), [
    view, user, customer, adminTab, canAccess, visibleTabs, toast, show,
    showUserAuth, showAdminLogin,
    stores, activeStores, currentStore, selectedStore,
    orders, liveOrders, customerOrders,
    stock, lowStock, deliveryPartners, deliveryZones, storeZones,
    franchises, waTemplates, viralCampaigns, customers, offers, rewardsConf, userLocation,
    products, availableProducts, partnerValues, roles, settings,
    cart, cartTotal, remarketingRecords, funnels, automationRules, chatbotFlows, chatMessages,
    login, logout, adminLogin, adminLogout, userSendOTP, userVerifyOTP, userLogout,
    addStore, updateStore, deleteStore, addOrder, updateOrderStatus,
    updateStock, addStockItem, deleteStockItem,
    updatePartnerStatus, addDeliveryPartner, updateZone, addZone,
    addFranchise, updateFranchise, updateWaTemplate, addWaTemplate, toggleViralCampaign,
    addProduct, updateProduct, deleteProduct,
    updatePartnerConfig, savePartnerConfig, toggleRoleTab, updateSetting, saveSettings,
    addToCart, removeFromCart, updateCartQty, placeOrder,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
