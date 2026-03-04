// TheValueStore — Deals, Promos & Rewards

export const offersConfig = [
  {
    id: 'OFF01', type: 'referral', name: 'Refer & Earn ₹500',
    desc: 'Share your code. Friends get ₹500 off, you earn ₹500 store credit.',
    code: 'TVS500', discount: 500, discountType: 'flat',
    minOrder: 2999, maxUses: 999, used: 0, active: true,
    icon: '🎁', color: '#25D366', channel: 'all',
    shareText: 'Get the best value on gaming PCs & tech! Use my code at TheValueStore for ₹500 OFF: {CODE}',
  },
  {
    id: 'OFF02', type: 'first_order', name: 'First Order: 15% OFF',
    desc: 'New customers get 15% off first order. Max ₹2,000.',
    code: 'WELCOME15', discount: 15, discountType: 'percent', maxDiscount: 2000,
    minOrder: 4999, maxUses: 9999, used: 0, active: true,
    icon: '🎉', color: '#3B82F6', channel: 'all',
  },
  {
    id: 'OFF03', type: 'flash', name: 'GPU Flash Sale — ₹3,000 OFF',
    desc: 'Instant ₹3,000 off on all RTX 40-series GPUs. Limited time.',
    code: 'GPUFLASH', discount: 3000, discountType: 'flat',
    minOrder: 39990, maxUses: 200, used: 0, active: true,
    icon: '⚡', color: '#F59E0B', channel: 'all',
  },
  {
    id: 'OFF04', type: 'bundle', name: 'Gaming Starter Kit — ₹5,000 OFF',
    desc: 'PC + Monitor + Keyboard + Mouse combo. Min cart ₹80,000.',
    code: 'STARTER5K', discount: 5000, discountType: 'flat',
    minOrder: 80000, maxUses: 100, used: 0, active: true,
    icon: '🎮', color: '#10B981', channel: 'all',
  },
  {
    id: 'OFF05', type: 'student', name: 'Student Offer: 10% OFF',
    desc: 'Valid .edu email or student ID. Max discount ₹1,500.',
    code: 'STUDENT10', discount: 10, discountType: 'percent', maxDiscount: 1500,
    minOrder: 2999, maxUses: 9999, used: 0, active: true,
    icon: '🎓', color: '#8B5CF6', channel: 'all',
  },
  {
    id: 'OFF06', type: 'flash', name: 'Laptop Festival — ₹7,000 OFF',
    desc: 'Select gaming & creator laptops. Min order ₹70,000.',
    code: 'LAPTOP7K', discount: 7000, discountType: 'flat',
    minOrder: 70000, maxUses: 150, used: 0, active: true,
    icon: '💻', color: '#EC4899', channel: 'all',
  },
  {
    id: 'OFF07', type: 'weekend', name: 'Weekend Gaming Deals — 12% OFF',
    desc: 'Fri–Sun only. On gaming gear & peripherals. Max ₹2,500.',
    code: 'WEEKEND12', discount: 12, discountType: 'percent', maxDiscount: 2500,
    minOrder: 3999, maxUses: 500, used: 0, active: true,
    icon: '🕹️', color: '#06B6D4', channel: 'all',
    timeStart: 'Fri 00:00', timeEnd: 'Sun 23:59',
  },
  {
    id: 'OFF08', type: 'whatsapp', name: 'WhatsApp Exclusive: ₹1,000 OFF',
    desc: 'Order via WhatsApp and get ₹1,000 off. Min order ₹15,000.',
    code: 'WACHAT1K', discount: 1000, discountType: 'flat',
    minOrder: 15000, maxUses: 300, used: 0, active: true,
    icon: '💬', color: '#25D366', channel: 'whatsapp',
  },
];

export const rewardsConfig = {
  enabled: true,
  pointsPerRupee: 1,
  pointsToRupeeRatio: 10,
  signupBonus: 100,
  referralBonus: 500,
  referralFriendBonus: 500,
  minRedeemPoints: 200,
  tiers: [
    { name: 'Bronze', minPoints: 0, multiplier: 1, perks: ['Basic rewards', 'Order tracking'] },
    { name: 'Silver', minPoints: 1000, multiplier: 1.5, perks: ['1.5x points', 'Early access to sales', 'Free shipping over ₹5K'] },
    { name: 'Gold', minPoints: 5000, multiplier: 2, perks: ['2x points', 'Free shipping', 'Exclusive builds', 'Priority support'] },
    { name: 'Platinum', minPoints: 15000, multiplier: 3, perks: ['3x points', 'Free shipping always', 'PC Builder priority', 'VIP events', 'Extended warranty'] },
  ],
};

// Deals engine — for homepage countdown / daily deals
export const dealsEngine = {
  dailyDeals: [
    { productId: 'GPU01', endsAt: 'today 23:59', label: 'RTX 4070 Super — Today Only' },
    { productId: 'LAP05', endsAt: 'today 23:59', label: 'Acer Nitro 5 — Daily Steal' },
  ],
  weekendGaming: [
    { productId: 'KB02', productId2: 'MOU01', label: 'Razer Combo Deal' },
    { productId: 'MON02', label: 'ASUS 165Hz — Weekend Price' },
  ],
  flashSale: { name: 'GPU Flash Sale', endsAt: '48h', code: 'GPUFLASH' },
  laptopFestival: { name: 'Laptop Festival', endsAt: '7d', code: 'LAPTOP7K' },
};
