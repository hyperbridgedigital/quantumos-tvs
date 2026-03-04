/**
 * i18n: Top 10 Indian + 10 International languages.
 * Keys used across homepage, store, Kynetra, Build PC.
 */

export const LANGUAGES = [
  // 10 Indian
  { code: 'en', name: 'English', native: 'English', region: 'IN', script: 'Latn' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', region: 'IN', script: 'Deva' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', region: 'IN', script: 'Beng' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', region: 'IN', script: 'Telu' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', region: 'IN', script: 'Deva' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', region: 'IN', script: 'Taml' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', region: 'IN', script: 'Gujr' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', region: 'IN', script: 'Knda' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', region: 'IN', script: 'Mlym' },
  { code: 'ur', name: 'Urdu', native: 'اردو', region: 'IN', script: 'Arab' },
  // 10 International
  { code: 'es', name: 'Spanish', native: 'Español', region: 'ES', script: 'Latn' },
  { code: 'fr', name: 'French', native: 'Français', region: 'FR', script: 'Latn' },
  { code: 'de', name: 'German', native: 'Deutsch', region: 'DE', script: 'Latn' },
  { code: 'pt', name: 'Portuguese', native: 'Português', region: 'BR', script: 'Latn' },
  { code: 'ar', name: 'Arabic', native: 'العربية', region: 'SA', script: 'Arab' },
  { code: 'zh', name: 'Chinese (Simplified)', native: '简体中文', region: 'CN', script: 'Hans' },
  { code: 'ja', name: 'Japanese', native: '日本語', region: 'JP', script: 'Jpan' },
  { code: 'ru', name: 'Russian', native: 'Русский', region: 'RU', script: 'Cyrl' },
  { code: 'ko', name: 'Korean', native: '한국어', region: 'KR', script: 'Kore' },
  { code: 'it', name: 'Italian', native: 'Italiano', region: 'IT', script: 'Latn' },
];

export const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', locale: 'ar-AE' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', locale: 'ar-SA' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble', locale: 'ru-RU' },
  { code: 'KRW', symbol: '₩', name: 'Korean Won', locale: 'ko-KR' },
];

/** Default strings (English). Other languages can extend in translations object. */
export const DEFAULT_STRINGS = {
  // Global
  home: 'Home',
  shop: 'Shop',
  categories: 'Categories',
  buildPc: 'Build PC',
  offers: 'Offers',
  trackOrder: 'Track Order',
  franchise: 'Franchise',
  cart: 'Cart',
  account: 'Account',
  search: 'Search',
  searchPlaceholder: 'Search products, brands...',
  // Hero
  heroTitle: 'Best Value. Maximum Performance.',
  heroSubtitle: 'Gaming PCs · Laptops · PC Components · Tech for Education',
  shopNow: 'Shop Now',
  buildYourPc: 'Build Your PC',
  // Kynetra
  kynetraSales: 'Sales',
  kynetraPreSales: 'Pre-sales',
  kynetraPostSales: 'Post-sales',
  kynetraCsr: 'Help',
  kynetraBuildPc: 'Build PC',
  chatWithUs: 'Chat with us',
  // Cart
  addToCart: 'Add to Cart',
  buyNow: 'Buy Now',
  outOfStock: 'Out of Stock',
  inStock: 'In Stock',
  freeDelivery: 'Free Delivery',
  // Footer
  help: 'Help',
  contact: 'Contact',
  returns: 'Returns',
  privacy: 'Privacy',
  terms: 'Terms',
  // Location & currency
  yourLocation: 'Your location',
  currency: 'Currency',
  language: 'Language',
  detectLocation: 'Detect location',
};

/** Translations: code -> { key -> text }. Only non-English keys needed; fallback to DEFAULT_STRINGS. */
export const translations = {
  hi: { home: 'होम', shop: 'खरीदें', cart: 'कार्ट', search: 'खोजें', buildPc: 'PC बनाएं', heroTitle: 'सर्वोत्तम मूल्य। अधिकतम प्रदर्शन।', shopNow: 'अभी खरीदें' },
  bn: { home: 'হোম', shop: 'কেনাকাটা', cart: 'কার্ট', search: 'খুঁজুন', buildPc: 'PC তৈরি করুন', heroTitle: 'সেরা মূল্য। সর্বোচ্চ পারফরম্যান্স।', shopNow: 'এখনই কিনুন' },
  te: { home: 'హోమ్', shop: 'షాప్', cart: 'కార్ట్', search: 'వెతకండి', buildPc: 'PC నిర్మించండి', heroTitle: 'ఉత్తమ విలువ। గరిష్ట పనితీరు।', shopNow: 'ఇప్పుడు షాప్ చేయండి' },
  mr: { home: 'मुख्यपृष्ठ', shop: 'खरेदी', cart: 'कार्ट', search: 'शोध', buildPc: 'PC तयार करा', heroTitle: 'उत्तम मूल्य। कमाल कामगिरी।', shopNow: 'आता खरेदी करा' },
  ta: { home: 'முகப்பு', shop: 'கடை', cart: 'பெட்டி', search: 'தேடல்', buildPc: 'PC உருவாக்கு', heroTitle: 'சிறந்த மதிப்பு. அதிகபட்ச செயல்திறன்.', shopNow: 'இப்போது வாங்குங்கள்' },
  gu: { home: 'હોમ', shop: 'ખરીદી', cart: 'કાર્ટ', search: 'શોધો', buildPc: 'PC બનાવો', heroTitle: 'શ્રેષ્ઠ મૂલ્ય. મહત્તમ પ્રદર્શન.', shopNow: 'હમણાં ખરીદો' },
  kn: { home: 'ಮುಖಪುಟ', shop: 'ಖರೀದಿ', cart: 'ಕಾರ್ಟ್', search: 'ಹುಡುಕಿ', buildPc: 'PC ನಿರ್ಮಿಸಿ', heroTitle: 'ಉತ್ತಮ ಮೌಲ್ಯ. ಗರಿಷ್ಠ ಕಾರ್ಯಕ್ಷಮತೆ.', shopNow: 'ಈಗ ಖರೀದಿಸಿ' },
  ml: { home: 'ഹോം', shop: 'ഷോപ്പ്', cart: 'കാർട്ട്', search: 'തിരയുക', buildPc: 'PC നിർമ്മിക്കുക', heroTitle: 'മികച്ച മൂല്യം. പരമാവധി പ്രകടനം.', shopNow: 'ഇപ്പോൾ ഷോപ്പ് ചെയ്യുക' },
  ur: { home: 'ہوم', shop: 'خریدیں', cart: 'کارٹ', search: 'تلاش کریں', buildPc: 'PC بنائیں', heroTitle: 'بہترین قیمت۔ زیادہ سے زیادہ کارکردگی۔', shopNow: 'ابھی خریدیں' },
  es: { home: 'Inicio', shop: 'Tienda', cart: 'Carrito', search: 'Buscar', buildPc: 'Construir PC', heroTitle: 'Mejor valor. Máximo rendimiento.', shopNow: 'Comprar ahora' },
  fr: { home: 'Accueil', shop: 'Boutique', cart: 'Panier', search: 'Rechercher', buildPc: 'Configurer PC', heroTitle: 'Meilleur rapport qualité. Performance max.', shopNow: 'Acheter' },
  de: { home: 'Start', shop: 'Shop', cart: 'Warenkorb', search: 'Suchen', buildPc: 'PC konfigurieren', heroTitle: 'Bester Wert. Max. Leistung.', shopNow: 'Jetzt kaufen' },
  pt: { home: 'Início', shop: 'Loja', cart: 'Carrinho', search: 'Pesquisar', buildPc: 'Montar PC', heroTitle: 'Melhor custo-benefício. Máximo desempenho.', shopNow: 'Comprar agora' },
  ar: { home: 'الرئيسية', shop: 'متجر', cart: 'السلة', search: 'بحث', buildPc: 'بناء جهاز', heroTitle: 'أفضل قيمة. أقصى أداء.', shopNow: 'تسوق الآن' },
  zh: { home: '首页', shop: '商店', cart: '购物车', search: '搜索', buildPc: '装机', heroTitle: '超值。高性能。', shopNow: '立即购买' },
  ja: { home: 'ホーム', shop: 'ショップ', cart: 'カート', search: '検索', buildPc: 'PCを組む', heroTitle: '最高の価値。最高のパフォーマンス。', shopNow: '今すぐ買う' },
  ru: { home: 'Главная', shop: 'Магазин', cart: 'Корзина', search: 'Поиск', buildPc: 'Собрать ПК', heroTitle: 'Лучшая цена. Максимальная производительность.', shopNow: 'Купить' },
  ko: { home: '홈', shop: '쇼핑', cart: '장바구니', search: '검색', buildPc: 'PC 맞춤 조립', heroTitle: '최고의 가치. 최고 성능.', shopNow: '지금 쇼핑' },
  it: { home: 'Home', shop: 'Negozio', cart: 'Carrello', search: 'Cerca', buildPc: 'Configura PC', heroTitle: 'Miglior rapporto qualità-prezzo. Prestazioni max.', shopNow: 'Acquista ora' },
};

export function t(locale, key) {
  const map = translations[locale];
  if (map && map[key]) return map[key];
  return DEFAULT_STRINGS[key] || key;
}
