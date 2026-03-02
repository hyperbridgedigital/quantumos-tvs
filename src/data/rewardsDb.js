// Rewards DB — v11.1.0
export const rewardsDb = {
  config: {
    pointsPerRupee: 1, pointsToRupeeRatio: 10, signupBonus: 50,
    referralBonus: 100, referralFriendBonus: 100, minRedeemPoints: 100,
    scratchCardEnabled: true, spinWheelEnabled: true, streakEnabled: true,
    birthdayReward: { type: 'percent', value: 25, maxDiscount: 300 },
    anniversaryReward: { type: 'flat', value: 200 },
    tiers: [
      { name:'Bronze', minPoints:0, multiplier:1, perks:['Basic rewards','1 point per ₹1'] },
      { name:'Silver', minPoints:500, multiplier:1.5, perks:['1.5x points','Priority delivery','Birthday freebie'] },
      { name:'Gold', minPoints:2000, multiplier:2, perks:['2x points','Free delivery','Birthday freebie','Exclusive menu access'] },
      { name:'Platinum', minPoints:5000, multiplier:3, perks:['3x points','Free delivery','VIP events','Personal concierge','Exclusive menu','Anniversary reward'] },
    ],
    milestones: [
      { orders:5, reward:'Free Dessert', points:100 },
      { orders:10, reward:'Free Biryani', points:250 },
      { orders:25, reward:'₹500 Voucher', points:500 },
      { orders:50, reward:'₹1000 Voucher + VIP Card', points:1000 },
    ],
    spinWheelPrizes: [
      { label:'10 Points', weight:30 },{ label:'25 Points', weight:25 },
      { label:'50 Points', weight:15 },{ label:'Free Chai', weight:12 },
      { label:'100 Points', weight:8 },{ label:'Free Dessert', weight:5 },
      { label:'₹100 OFF', weight:3 },{ label:'JACKPOT 500 Pts', weight:2 },
    ],
    scratchCardPrizes: [
      { label:'5 Points', weight:35 },{ label:'10 Points', weight:25 },
      { label:'20 Points', weight:15 },{ label:'Free Chai', weight:10 },
      { label:'50 Points', weight:8 },{ label:'₹50 OFF', weight:5 },
      { label:'100 Points', weight:2 },
    ],
    streakRewards: [
      { days:3, reward:'15 Bonus Points' },{ days:7, reward:'50 Bonus Points + Free Chai' },
      { days:14, reward:'150 Bonus Points' },{ days:30, reward:'500 Bonus Points + Free Biryani' },
    ],
    redemptionCatalog: [
      { id:'RED01', name:'₹50 OFF Coupon', points:500, type:'coupon', value:50 },
      { id:'RED02', name:'Free Irani Chai', points:200, type:'freebie', item:'Irani Chai' },
      { id:'RED03', name:'Free Biryani', points:1000, type:'freebie', item:'Signature Biryani' },
      { id:'RED04', name:'₹200 OFF Coupon', points:2000, type:'coupon', value:200 },
      { id:'RED05', name:'Free Party Box', points:5000, type:'freebie', item:'Party Box (10pc)' },
      { id:'RED06', name:'₹500 OFF Coupon', points:5000, type:'coupon', value:500 },
    ],
    referralLevels: [
      { level:1, bonus:100, label:'Direct Referral' },
      { level:2, bonus:25, label:'2nd Level' },
      { level:3, bonus:10, label:'3rd Level' },
    ],
  },
  userRewards: [],
};
