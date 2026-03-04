// Admin-configurable offers, rewards, freebies
// These appear on the storefront and are managed in Marketing admin

export const offersConfig = [
  {
    id: 'OFF01', type: 'referral', name: 'Refer & Earn ₹100',
    desc: 'Share your code. Friends get ₹100 off, you earn ₹100 wallet credit.',
    code: 'TVS100', discount: 100, discountType: 'flat',
    minOrder: 299, maxUses: 999, used: 342, active: true,
    icon: '🎁', color: '#25D366', channel: 'all',
    shareText: 'Hey! Shop at TheValueStore and get ₹100 OFF with my code: {CODE}. Best value on tech! 🎮',
  },
  {
    id: 'OFF02', type: 'first_order', name: 'First Order: 20% OFF',
    desc: 'New customers get 20% off their first order. Max ₹150.',
    code: 'WELCOME20', discount: 20, discountType: 'percent', maxDiscount: 150,
    minOrder: 199, maxUses: 9999, used: 1580, active: true,
    icon: '🎉', color: '#8B5CF6', channel: 'all',
  },
  {
    id: 'OFF02B', type: 'category', name: 'Gaming PCs: ₹500 OFF',
    desc: '₹500 off on any gaming PC or prebuilt. Min order ₹20,000.',
    code: 'GAMING50', discount: 500, discountType: 'flat',
    minOrder: 20000, maxUses: 999, used: 120, active: true,
    icon: '🎮', color: '#22C55E', channel: 'all',
  },
  {
    id: 'OFF03', type: 'freebie', name: 'Free Shipping',
    desc: 'Free delivery on orders above ₹999. Valid on all PCs and laptops.',
    code: 'FREESHIP', discount: 0, discountType: 'freebie', freebieItem: 'Free Delivery',
    minOrder: 999, maxUses: 500, used: 89, active: true,
    icon: '🚚', color: '#F59E0B', channel: 'all',
  },
  {
    id: 'OFF04', type: 'bundle', name: 'Build Your PC: ₹1,000 OFF',
    desc: 'Order a custom Build Your PC config and get ₹1,000 off. Min order ₹25,000.',
    code: 'BUILD100', discount: 1000, discountType: 'flat',
    minOrder: 25000, maxUses: 300, used: 67, active: true,
    icon: '🖥️', color: '#3B82F6', channel: 'all',
  },
  {
    id: 'OFF05', type: 'loyalty', name: 'Loyalty: Every 5th Order 5% Back',
    desc: 'Complete 5 orders to unlock 5% wallet credit on your next order.',
    code: 'LOYAL5', discount: 0, discountType: 'freebie', freebieItem: '5% Wallet Credit',
    minOrder: 0, maxUses: 9999, used: 210, active: true,
    icon: '🏆', color: '#22C55E', channel: 'all',
  },
  {
    id: 'OFF06', type: 'flash', name: 'Happy Hours: 15% OFF (2-5 PM)',
    desc: 'Order between 2-5 PM for 15% off. Valid on all items.',
    code: 'HAPPY15', discount: 15, discountType: 'percent', maxDiscount: 120,
    minOrder: 149, maxUses: 999, used: 445, active: true,
    icon: '⏰', color: '#EC4899', channel: 'all',
    timeStart: '14:00', timeEnd: '17:00',
  },
  {
    id: 'OFF07', type: 'whatsapp', name: 'WhatsApp Exclusive: ₹75 OFF',
    desc: 'Order via WhatsApp and get ₹75 off instantly.',
    code: 'WACHAT75', discount: 75, discountType: 'flat',
    minOrder: 249, maxUses: 500, used: 123, active: true,
    icon: '💬', color: '#25D366', channel: 'whatsapp',
  },
  {
    id: 'OFF08', type: 'birthday', name: 'Birthday Special: 25% OFF',
    desc: 'Celebrate your birthday with 25% off! Auto-applied on your special day.',
    code: 'BDAY25', discount: 25, discountType: 'percent', maxDiscount: 300,
    minOrder: 199, maxUses: 9999, used: 89, active: false,
    icon: '🎂', color: '#F97316', channel: 'all',
  },
];

export const rewardsConfig = {
  enabled: true,
  pointsPerRupee: 1,         // 1 point per ₹1 spent
  pointsToRupeeRatio: 10,    // 10 points = ₹1 discount
  signupBonus: 50,            // 50 points on signup
  referralBonus: 100,         // 100 points for referring
  referralFriendBonus: 100,   // ₹100 off for referred friend
  minRedeemPoints: 100,       // Need at least 100 points
  tiers: [
    { name: 'Bronze', minPoints: 0, multiplier: 1, perks: ['Basic rewards'] },
    { name: 'Silver', minPoints: 500, multiplier: 1.5, perks: ['1.5x points', 'Priority delivery'] },
    { name: 'Gold', minPoints: 2000, multiplier: 2, perks: ['2x points', 'Free delivery', 'Birthday discount'] },
    { name: 'Platinum', minPoints: 5000, multiplier: 3, perks: ['3x points', 'Free delivery', 'Exclusive deals', 'VIP support'] },
  ],
};
