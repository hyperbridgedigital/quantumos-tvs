// Campaigns Database — v11.1.0
export const campaigns = [
  { id:'CAMP01', name:'Welcome Series', type:'automated', status:'active', promoCode:'WELCOME20', template:'TPL03', audience:'new_customer', sentCount:1580, openRate:0.68, conversionRate:0.22, revenue:47400, createdAt:'2025-06-01' },
  { id:'CAMP02', name:'Win-Back Gold Customers', type:'manual', status:'active', promoCode:'COMEBACK15', template:'TPL04', audience:'at_risk_gold', sentCount:120, openRate:0.55, conversionRate:0.18, revenue:12960, createdAt:'2026-01-15' },
  { id:'CAMP03', name:'Birthday Auto-Offer', type:'automated', status:'active', promoCode:'BDAY30', template:'TPL06', audience:'birthday_this_month', sentCount:89, openRate:0.72, conversionRate:0.35, revenue:9345, createdAt:'2025-08-01' },
  { id:'CAMP04', name:'Pongal Festival Special', type:'manual', status:'completed', promoCode:'PONGAL25', template:'TPL_FESTIVAL', audience:'all_opted_in', sentCount:2400, openRate:0.61, conversionRate:0.15, revenue:86400, createdAt:'2026-01-10' },
  { id:'CAMP05', name:'ECR Launch Blast', type:'manual', status:'completed', promoCode:'ECR25', template:'TPL_LAUNCH', audience:'ecr_area', sentCount:800, openRate:0.58, conversionRate:0.20, revenue:48000, createdAt:'2025-06-15' },
];
