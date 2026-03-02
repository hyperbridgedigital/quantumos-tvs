// Referral Tree Database — v11.1.0
export const referrals = [
  { code:'REF001', userId:'C001', name:'Priya Sharma', level:0, referredBy:null, referrals:['REF005','REF008','REF012'], shares:12, conversions:3, earnings:300, status:'active', createdAt:'2025-06-15' },
  { code:'REF002', userId:'C003', name:'Sneha Mehta', level:0, referredBy:null, referrals:['REF006','REF009','REF010','REF011'], shares:28, conversions:4, earnings:400, status:'active', createdAt:'2025-04-20' },
  { code:'REF003', userId:'C005', name:'Fatima Begum', level:0, referredBy:null, referrals:['REF007'], shares:8, conversions:1, earnings:100, status:'active', createdAt:'2025-08-10' },
  { code:'REF004', userId:'C002', name:'Aamir Khan', level:0, referredBy:null, referrals:['REF013','REF014'], shares:15, conversions:2, earnings:200, status:'active', createdAt:'2025-07-01' },
  { code:'REF005', userId:'C010', name:'Vikram Kumar', level:1, referredBy:'REF001', referrals:['REF015'], shares:5, conversions:1, earnings:125, status:'active', createdAt:'2025-09-01' },
  { code:'REF006', userId:'C012', name:'Karthik Nair', level:1, referredBy:'REF002', referrals:[], shares:3, conversions:0, earnings:0, status:'active', createdAt:'2025-10-15' },
  { code:'REF007', userId:'C015', name:'Reshma Begum', level:1, referredBy:'REF003', referrals:[], shares:2, conversions:0, earnings:0, status:'active', createdAt:'2025-11-20' },
  { code:'REF008', userId:'C018', name:'Farhan Ahmed', level:1, referredBy:'REF001', referrals:[], shares:6, conversions:1, earnings:100, status:'active', createdAt:'2025-12-01' },
  { code:'REF009', userId:'C020', name:'Venkat Rao', level:1, referredBy:'REF002', referrals:['REF016'], shares:4, conversions:1, earnings:125, status:'active', createdAt:'2026-01-05' },
  { code:'REF010', userId:'C022', name:'Nithya Subramani', level:1, referredBy:'REF002', referrals:[], shares:1, conversions:0, earnings:0, status:'active', createdAt:'2026-01-15' },
  { code:'REF015', userId:'C030', name:'Ashwin Balaji', level:2, referredBy:'REF005', referrals:[], shares:1, conversions:0, earnings:0, status:'active', createdAt:'2026-02-01' },
  { code:'REF016', userId:'C035', name:'Ganesh Selvam', level:2, referredBy:'REF009', referrals:[], shares:0, conversions:0, earnings:0, status:'active', createdAt:'2026-02-10' },
];

export const referralConfig = {
  maxSharesPerDay: 10, globalDailyLimit: 10000,
  antifraud: { selfReferralBlock:true, duplicateDetection:true, velocityCheckWindow:3600, suspiciousThreshold:20 },
  kFactor: { invitesSent:0, conversions:0, computed:0 },
};
