// SEO Database — v11.1.0 — TheValueStore
export const seoDb = {
  pages: {
    home: { title:'TheValueStore — Best Value. Maximum Performance. | Gaming PCs, Laptops & Tech', description:'Premium computer and gaming ecommerce — Build your PC, shop RTX gaming rigs, AI-ready laptops, components, and tech.', keywords:'gaming PC, laptop, RTX, build your PC, tech store, TheValueStore', ogImage:'/og-home.jpg', canonical:'https://thevaluestore.com', robots:'index,follow', h1:'Best Value. Maximum Performance.' },
    menu: { title:'Products | TheValueStore', description:'Browse gaming PCs, laptops, components, and tech. Order online.', keywords:'gaming PC, laptop, components, tech menu', ogImage:'/og-menu.jpg', canonical:'https://thevaluestore.com/menu', robots:'index,follow', h1:'Our Products' },
    stores: { title:'Store Locations | TheValueStore', description:'Visit TheValueStore locations. Online and nationwide.', keywords:'TheValueStore locations, tech store', ogImage:'/og-stores.jpg', canonical:'https://thevaluestore.com/stores', robots:'index,follow', h1:'Our Locations' },
  },
  schemas: {
    restaurant: { '@context':'https://schema.org', '@type':'Store', name:'TheValueStore', address:{ '@type':'PostalAddress', addressLocality:'Chennai', postalCode:'600017', addressCountry:'IN' } },
    localBusiness: { '@context':'https://schema.org', '@type':'LocalBusiness', name:'TheValueStore', telephone:'+91 44 4500 1234', openingHours:'Mo-Su 10:00-22:00' },
  },
  sitemap: { lastGenerated:'2026-02-28', urls:['/','/menu','/stores','/blog','/about','/contact'] },
  robotsTxt: 'User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: https://thevaluestore.com/sitemap.xml',
  redirects: [],
  internalLinks: [],
  altTexts: {},
  pageSpeedScores: { home:{ performance:88, accessibility:92, seo:95, bestPractices:90 }, menu:{ performance:85, accessibility:90, seo:93, bestPractices:88 } },
};
