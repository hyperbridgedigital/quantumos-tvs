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
    { id:'BP01', title:'The Secret Behind Our Biryani', slug:'secret-biryani', excerpt:'Discover the 200-year-old recipe...', body:'Our biryani traces its roots to the royal kitchens of tradition...', tags:['food','heritage','biryani'], seoTitle:'Secret Behind Signature Biryani | Charminar Mehfil', seoDesc:'Discover the 200-year-old recipe behind our legendary biryani.', author:'Chef Mahmood', published:true, publishedAt:'2025-12-15', featured:true },
    { id:'BP02', title:'Chennai Food Scene: Our Journey', slug:'chennai-journey', excerpt:'How we brought signature flavors to Chennai...', body:'When we decided to open in Chennai, we knew the city deserved authentic cuisine...', tags:['chennai','story','launch'], seoTitle:'Chennai Food Journey | Charminar Mehfil', seoDesc:'Our journey bringing authentic cuisine to Chennai.', author:'Team Mehfil', published:true, publishedAt:'2026-01-10', featured:true },
    { id:'BP03', title:'Irani Chai: A Cup of Heritage', slug:'irani-chai-heritage', excerpt:'The story of our signature Irani Chai...', body:'Irani Chai is more than just a beverage...', tags:['chai','heritage','beverages'], seoTitle:'Irani Chai Heritage | Charminar Mehfil', seoDesc:'The story behind our signature Irani Chai.', author:'Chef Mahmood', published:true, publishedAt:'2026-02-01', featured:false },
  ],
  communityPosts: [
    { id:'UGC01', author:'Priya S.', text:'Best biryani in Chennai! 🔥', rating:5, status:'approved', featured:true, date:'2026-02-20' },
    { id:'UGC02', author:'Karthik R.', text:'The Irani Chai is addictive!', rating:5, status:'approved', featured:true, date:'2026-02-18' },
    { id:'UGC03', author:'Meera V.', text:'Loved the ambiance at ECR outlet', rating:4, status:'approved', featured:false, date:'2026-02-15' },
    { id:'UGC04', author:'Farhan M.', text:'Party box was perfect for our gathering', rating:5, status:'pending', featured:false, date:'2026-02-22' },
  ],
  textBlocks: {
    about: 'Charminar Mehfil brings the authentic taste of tradition to Chennai. Our recipes have been perfected over generations, using the finest spices and traditional cooking methods.',
    story: 'Founded with a passion for preserving culinary heritage, Charminar Mehfil has been serving iconic dishes since 2006.',
  },
  footer: {
    links: [
      { label:'About Us', url:'/about' },{ label:'Menu', url:'/menu' },
      { label:'Stores', url:'/stores' },{ label:'Careers', url:'/careers' },
      { label:'Contact', url:'/contact' },{ label:'Privacy Policy', url:'/privacy' },
    ],
    social: { instagram:'@charminarmehfil', facebook:'charminarmehfil', twitter:'@mehfil_chennai', youtube:'charminarmehfil' },
    contact: { phone:'+91 44 4500 1234', email:'hello@charminarmehfil.com', address:'Chennai, Tamil Nadu' },
  },
  announcementBar: { active:true, text:'🎉 Grand Opening Special — 20% OFF with code WELCOME20', link:'/offers', bgColor:'#C9A84C', textColor:'#0C0B09' },
  instagramFeed: {
    active: true,
    title: 'Follow Us on Instagram',
    subtitle: 'Latest moments, dishes, and reels from Charminar Mehfil',
    maxItems: 8,
    posts: [
      { id:'IG01', url:'https://www.instagram.com/p/C8m1mQmP1Q1/', mediaType:'image', caption:'Signature Dum Biryani', active:true, order:1 },
      { id:'IG02', url:'https://www.instagram.com/reel/C9a2aQaR2R2/', mediaType:'video', caption:'Kitchen reel: dum process', active:true, order:2 },
      { id:'IG03', url:'https://www.instagram.com/p/C9c3cQcP3P3/', mediaType:'image', caption:'Weekend family platter', active:true, order:3 },
      { id:'IG04', url:'https://www.instagram.com/reel/C9d4dQdR4R4/', mediaType:'video', caption:'Live tandoor action', active:true, order:4 },
    ],
  },
  sectionOrder: ['announcementBar','heroBanners','instagramFeed','offersStrip','menuDisplay','blogPosts','communityPosts','textBlocks','footer'],
  versionHistory: [],
  scheduledPublishes: [],
};
