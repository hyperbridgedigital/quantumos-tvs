// CMS Database — v11.1.0
export const cmsDb = {
  heroBanners: [
    { id:'HB01', title:'Autonomous. Connected. Scalable.', subtitle:'Authentic Biryani & More', cta:'Order Now', ctaLink:'/menu', gradient:'linear-gradient(135deg,#0C0B09 0%,#1a1510 100%)', imageUrl:'/hero-biryani.jpg', active:true, order:1 },
    { id:'HB02', title:'Now in Chennai!', subtitle:'ECR & ECR — Open Daily', cta:'Find Us', ctaLink:'/stores', gradient:'linear-gradient(135deg,#1a0f05 0%,#0C0B09 100%)', imageUrl:'/hero-store.jpg', active:true, order:2 },
    { id:'HB03', title:'Free Delivery Above ₹299', subtitle:'Hot & Fresh in 60 Minutes', cta:'Browse Menu', ctaLink:'/menu', gradient:'linear-gradient(135deg,#0a0d05 0%,#0C0B09 100%)', imageUrl:'/hero-delivery.jpg', active:true, order:3 },
    { id:'HB04', title:'Refer & Earn ₹100', subtitle:'Share the love, earn rewards', cta:'Share Now', ctaLink:'/referral', gradient:'linear-gradient(135deg,#050a0d 0%,#0C0B09 100%)', imageUrl:'/hero-referral.jpg', active:true, order:4 },
    { id:'HB05', title:'Catering & Party Orders', subtitle:'Serving 10 to 10,000 guests', cta:'Enquire', ctaLink:'/catering', gradient:'linear-gradient(135deg,#0d0a05 0%,#0C0B09 100%)', imageUrl:'/hero-catering.jpg', active:false, order:5 },
  ],
  menuDisplay: { featuredCategories:['biryani','starters','desserts'], sortBy:'popularity', showPrices:true, showTags:true },
  offersStrip: { active:true, promos:['WELCOME20','BIRYANI50','FLAT100'] },
  blogPosts: [
    { id:'BP01', title:'The Secret Behind Our Biryani', slug:'secret-biryani', excerpt:'Discover the 200-year-old recipe...', body:'Our biryani traces its roots to the royal kitchens of tradition...', tags:['food','heritage','biryani'], seoTitle:'Secret Behind Signature Biryani | TheValueStore', seoDesc:'Discover the 200-year-old recipe behind our legendary biryani.', author:'Chef Mahmood', published:true, publishedAt:'2025-12-15', featured:true },
    { id:'BP02', title:'Chennai Food Scene: Our Journey', slug:'chennai-journey', excerpt:'How we brought signature flavors to Chennai...', body:'When we decided to open in Chennai, we knew the city deserved authentic cuisine...', tags:['chennai','story','launch'], seoTitle:'Chennai Food Journey | TheValueStore', seoDesc:'Our journey bringing authentic cuisine to Chennai.', author:'TheValueStore Team', published:true, publishedAt:'2026-01-10', featured:true },
    { id:'BP03', title:'Irani Chai: A Cup of Heritage', slug:'irani-chai-heritage', excerpt:'The story of our signature Irani Chai...', body:'Irani Chai is more than just a beverage...', tags:['chai','heritage','beverages'], seoTitle:'Irani Chai Heritage | TheValueStore', seoDesc:'The story behind our signature Irani Chai.', author:'Chef Mahmood', published:true, publishedAt:'2026-02-01', featured:false },
  ],
  communityPosts: [
    { id:'UGC01', author:'Priya S.', text:'Best biryani in Chennai! 🔥', rating:5, status:'approved', featured:true, date:'2026-02-20' },
    { id:'UGC02', author:'Karthik R.', text:'The Irani Chai is addictive!', rating:5, status:'approved', featured:true, date:'2026-02-18' },
    { id:'UGC03', author:'Meera V.', text:'Loved the ambiance at ECR outlet', rating:4, status:'approved', featured:false, date:'2026-02-15' },
    { id:'UGC04', author:'Farhan M.', text:'Party box was perfect for our gathering', rating:5, status:'pending', featured:false, date:'2026-02-22' },
  ],
  textBlocks: {
    about: 'TheValueStore delivers best value and maximum performance — gaming PCs, laptops, components, and tech.',
    story: 'Founded to bring premium tech at fair prices, TheValueStore has been serving gamers and professionals.',
  },
  footer: {
    links: [
      { label:'About Us', url:'/about' },{ label:'Menu', url:'/menu' },
      { label:'Stores', url:'/stores' },{ label:'Careers', url:'/careers' },
      { label:'Contact', url:'/contact' },{ label:'Privacy Policy', url:'/privacy' },
    ],
    social: { instagram:'@thevaluestore', facebook:'thevaluestore', twitter:'@thevaluestore', youtube:'thevaluestore' },
    contact: { phone:'+91 44 4500 1234', email:'hello@thevaluestore.com', address:'Chennai, Tamil Nadu' },
  },
  announcementBar: { active:true, text:'🎉 Grand Opening Special — 20% OFF with code WELCOME20', link:'/offers', bgColor:'#C9A84C', textColor:'#0C0B09' },
  sectionOrder: ['announcementBar','heroBanners','offersStrip','menuDisplay','blogPosts','communityPosts','textBlocks','footer'],
  versionHistory: [],
  scheduledPublishes: [],
};
