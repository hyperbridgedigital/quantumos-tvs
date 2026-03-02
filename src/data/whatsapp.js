export const waTemplates = [
  { id:'TPL01', name:'order_confirmation', status:'approved', category:'UTILITY', lang:'en', body:'Hi {{1}}! Your order #{{2}} has been confirmed. Total: ₹{{3}}. Track: {{4}}', params:4, sent:1240 },
  { id:'TPL02', name:'delivery_update', status:'approved', category:'UTILITY', lang:'en', body:'{{1}}, your order is out for delivery! ETA: {{2}} mins. Driver: {{3}} ({{4}})', params:4, sent:890 },
  { id:'TPL03', name:'welcome_offer', status:'approved', category:'MARKETING', lang:'en', body:'Welcome to Charminar Mehfil {{1}}! 🎉 Get {{2}}% off on your first order with code: {{3}}', params:3, sent:3200 },
  { id:'TPL04', name:'reorder_reminder', status:'pending', category:'MARKETING', lang:'en', body:'Hi {{1}}, we miss you! Your favorite {{2}} is waiting. Order now & get {{3}} OFF!', params:3, sent:0 },
  { id:'TPL05', name:'referral_invite', status:'approved', category:'MARKETING', lang:'en', body:'{{1}} invited you to Charminar Mehfil! Use code {{2}} for ₹{{3}} off your first order 🕌', params:3, sent:5600 },
  { id:'TPL06', name:'birthday_wish', status:'approved', category:'MARKETING', lang:'en', body:'Happy Birthday {{1}}! 🎂 Celebrate with {{2}}% off today. Use code: {{3}}', params:3, sent:420 },
];

export const viralCampaigns = [
  { name:'Referral Program', desc:'Share & earn ₹50 per friend. Friends get ₹100 off.', active:true, shares:5600, revenue:280000 },
  { name:'WhatsApp Order Sharing', desc:'Share order receipt on WhatsApp. Get 10% off next order.', active:true, shares:3200, revenue:96000 },
  { name:'Group Order Discount', desc:'Order as a group of 5+ on WhatsApp. Get 20% off.', active:false, shares:0, revenue:0 },
  { name:'Birthday Auto-Offer', desc:'Auto-send birthday discount via WhatsApp.', active:true, shares:890, revenue:44500 },
  { name:'Spin & Win via WA', desc:"Send 'SPIN' to play and win coupons.", active:true, shares:4200, revenue:126000 },
  { name:'Story Share Reward', desc:'Share on WA Status, screenshot to earn points.', active:false, shares:0, revenue:0 },
];
