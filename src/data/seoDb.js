// SEO Database — v11.1.0
export const seoDb = {
  pages: {
    home: { title:'Charminar Mehfil & Mount Road Sangam | Best Biryani in Chennai', description:'Authentic Signature Biryani, Irani Chai & more. Order online for delivery in 60 minutes from ECR & ECR Chennai.', keywords:'biryani chennai, signature biryani, irani chai, chennai restaurant, mehfil', ogImage:'/og-home.jpg', canonical:'https://charminarmehfil.com', robots:'index,follow', h1:'Authentic Signature Cuisine in Chennai' },
    menu: { title:'Menu | Charminar Mehfil Chennai', description:'Browse our full menu — Biryani, Kebabs, Desserts, Beverages & more. Order online now.', keywords:'biryani menu, kebab menu, chennai food menu', ogImage:'/og-menu.jpg', canonical:'https://charminarmehfil.com/menu', robots:'index,follow', h1:'Our Menu' },
    stores: { title:'Store Locations | ECR & ECR Chennai', description:'Visit Charminar Mehfil at ECR or Mount Road Sangam at ECR. Open 11 AM - 11:30 PM.', keywords:'mehfil t nagar, mehfil ecr, chennai restaurant location', ogImage:'/og-stores.jpg', canonical:'https://charminarmehfil.com/stores', robots:'index,follow', h1:'Our Locations' },
  },
  schemas: {
    restaurant: { '@context':'https://schema.org', '@type':'Restaurant', name:'Charminar Mehfil', servesCuisine:['Signature','Indian','Mughlai'], priceRange:'₹₹', address:{ '@type':'PostalAddress', streetAddress:'1, Thanikachalam Rd', addressLocality:'Chennai', postalCode:'600017', addressCountry:'IN' } },
    localBusiness: { '@context':'https://schema.org', '@type':'LocalBusiness', name:'Charminar Mehfil & Mount Road Sangam', telephone:'+91 44 4500 1234', openingHours:'Mo-Su 11:00-23:30' },
  },
  sitemap: { lastGenerated:'2026-02-28', urls:['/','menu','/stores','/blog','/about','/contact'] },
  robotsTxt: 'User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: https://charminarmehfil.com/sitemap.xml',
  redirects: [],
  internalLinks: [],
  altTexts: {},
  pageSpeedScores: { home:{ performance:88, accessibility:92, seo:95, bestPractices:90 }, menu:{ performance:85, accessibility:90, seo:93, bestPractices:88 } },
};
