// CMS Database — v11.1.0 — TheValueStore
export const cmsDb = {
  heroBanners: [
    { id:'HB01', title:'Best Value. Maximum Performance.', subtitle:'Gaming PCs · Laptops · Build Your PC', cta:'Shop Now', ctaLink:'/menu', gradient:'linear-gradient(135deg,#0C0B09 0%,#1a1510 100%)', imageUrl:'/hero-gaming.jpg', active:true, order:1 },
    { id:'HB02', title:'Now in Chennai!', subtitle:'T. Nagar · ECR · Mount Road', cta:'Find Store', ctaLink:'/stores', gradient:'linear-gradient(135deg,#1a0f05 0%,#0C0B09 100%)', imageUrl:'/hero-store.jpg', active:true, order:2 },
    { id:'HB03', title:'Free Delivery Above ₹999', subtitle:'Fast & Secure in 60 Minutes', cta:'Browse Shop', ctaLink:'/menu', gradient:'linear-gradient(135deg,#0a0d05 0%,#0C0B09 100%)', imageUrl:'/hero-delivery.jpg', active:true, order:3 },
    { id:'HB04', title:'Refer & Earn ₹100', subtitle:'Share the love, earn rewards', cta:'Share Now', ctaLink:'/referral', gradient:'linear-gradient(135deg,#050a0d 0%,#0C0B09 100%)', imageUrl:'/hero-referral.jpg', active:true, order:4 },
    { id:'HB05', title:'Build Your PC', subtitle:'50+ features · Compatibility check · Save & share', cta:'Build PC', ctaLink:'/buildpc', gradient:'linear-gradient(135deg,#0d0a05 0%,#0C0B09 100%)', imageUrl:'/hero-buildpc.jpg', active:true, order:5 },
  ],
  menuDisplay: { featuredCategories:['gaming-pcs','laptops','components'], sortBy:'popularity', showPrices:true, showTags:true },
  offersStrip: { active:true, promos:['WELCOME20','GAMING50','BUILD100'] },
  blogPosts: [
    { id:'BP01', title:'Why Build Your Own PC?', slug:'why-build-pc', excerpt:'Get the best value and performance by choosing every component...', body:'Building your own PC lets you match specs to your budget and use case...', tags:['gaming','build-pc','guides'], seoTitle:'Why Build Your Own PC | TheValueStore', seoDesc:'Get the best value by building your own gaming PC.', author:'TheValueStore Team', published:true, publishedAt:'2025-12-15', featured:true },
    { id:'BP02', title:'Chennai Tech Scene: Our Journey', slug:'chennai-journey', excerpt:'How we brought best-value tech to Chennai...', body:'When we decided to open in Chennai, we knew the city deserved honest pricing and real performance...', tags:['chennai','story','launch'], seoTitle:'Chennai Tech Journey | TheValueStore', seoDesc:'Our journey bringing best-value tech to Chennai.', author:'TheValueStore Team', published:true, publishedAt:'2026-01-10', featured:true },
    { id:'BP03', title:'Gaming Laptops vs Desktops', slug:'laptop-vs-desktop', excerpt:'Choose the right rig for your setup...', body:'Gaming laptops offer portability; desktops offer upgradability and raw power...', tags:['gaming','laptops','guides'], seoTitle:'Gaming Laptops vs Desktops | TheValueStore', seoDesc:'Choose the right gaming setup for you.', author:'TheValueStore Team', published:true, publishedAt:'2026-02-01', featured:false },
  ],
  communityPosts: [
    { id:'UGC01', author:'Priya S.', text:'Best place for gaming PCs in Chennai! 🔥', rating:5, status:'approved', featured:true, date:'2026-02-20' },
    { id:'UGC02', author:'Karthik R.', text:'Build Your PC tool is super helpful!', rating:5, status:'approved', featured:true, date:'2026-02-18' },
    { id:'UGC03', author:'Meera V.', text:'Loved the T. Nagar store experience', rating:4, status:'approved', featured:false, date:'2026-02-15' },
    { id:'UGC04', author:'Farhan M.', text:'Got my dream rig within budget', rating:5, status:'pending', featured:false, date:'2026-02-22' },
  ],
  textBlocks: {
    about: 'TheValueStore delivers best value and maximum performance — gaming PCs, laptops, components, and tech.',
    story: 'Founded to bring premium tech at fair prices, TheValueStore has been serving gamers and professionals.',
  },
  footer: {
    links: [
      { label:'About Us', url:'/about' },{ label:'Shop', url:'/menu' },
      { label:'Stores', url:'/stores' },{ label:'Careers', url:'/careers' },
      { label:'Contact', url:'/contact' },{ label:'Privacy Policy', url:'/privacy' },
    ],
    social: { instagram:'@thevaluestore', facebook:'thevaluestore', twitter:'@thevaluestore', youtube:'thevaluestore' },
    contact: { phone:'+91 44 4500 1234', email:'hello@thevaluestore.com', address:'Chennai, Tamil Nadu' },
  },
  announcementBar: { active:true, text:'🎉 Grand Opening — 20% OFF with code WELCOME20 · Gaming PCs · Laptops · Build Your PC', link:'/offers', bgColor:'#0F172A', textColor:'#FFFFFF' },
  sectionOrder: ['announcementBar','heroBanners','offersStrip','menuDisplay','blogPosts','communityPosts','textBlocks','footer'],
  versionHistory: [],
  scheduledPublishes: [],
};
