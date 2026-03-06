/**
 * TheValueStore homepage content: hero banners, categories, value picks, deals, gaming zone, business, CSR.
 * Driven by master prompt structure; can be moved to CMS later.
 */

export const HERO_BANNERS = [
  {
    id: 'hero1',
    title: 'Build Your Dream PC',
    subtitle: 'Customize every component. Best prices, expert support.',
    cta: 'Start PC Builder',
    ctaAction: 'buildpc',
    gradient: 'linear-gradient(135deg, #0F0F0F 0%, #1A1A1A 50%, #1D4ED8 100%)',
  },
  {
    id: 'hero2',
    title: 'RTX Gaming Starts Here',
    subtitle: 'Next-gen GPUs, prebuilt rigs, and gaming laptops.',
    cta: 'Shop Gaming PCs',
    ctaAction: 'shop',
    ctaQuery: 'category=gaming-pcs',
    gradient: 'linear-gradient(135deg, #0F0F0F 0%, #1D4ED8 60%, #3B82F6 100%)',
  },
  {
    id: 'hero3',
    title: 'AI-Ready Laptops',
    subtitle: 'NPU-powered. For creators and professionals.',
    cta: 'Shop AI PCs',
    ctaAction: 'shop',
    ctaQuery: 'category=laptops',
    gradient: 'linear-gradient(135deg, #0F0F0F 0%, #10B981 70%, #34D399 100%)',
  },
  {
    id: 'hero4',
    title: 'Tech That Gives Back',
    subtitle: 'Digital classrooms, coding labs, e-waste recycling.',
    cta: 'Explore CSR',
    ctaAction: 'csr',
    gradient: 'linear-gradient(135deg, #0F0F0F 0%, #065F46 60%, #10B981 100%)',
  },
];

export const QUICK_CATEGORIES = [
  { id: 'laptops', label: 'Laptops', slug: 'laptops', icon: '💻' },
  { id: 'gaming-pcs', label: 'Gaming PCs', slug: 'gaming-pcs', icon: '🖥️' },
  { id: 'components', label: 'PC Components', slug: 'components', icon: '⚙️' },
  { id: 'monitors', label: 'Monitors', slug: 'monitors', icon: '🖥' },
  { id: 'storage', label: 'Storage', slug: 'storage', icon: '💾' },
  { id: 'networking', label: 'Networking', slug: 'networking', icon: '📡' },
  { id: 'peripherals', label: 'Accessories', slug: 'peripherals', icon: '⌨️' },
  { id: 'refurbished', label: 'Refurbished Value Deals', slug: 'refurbished', icon: '♻️' },
];

export const VALUE_PICK_TAGS = ['Best Value', 'Top Gaming Pick', 'Creator Choice'];

export const BUILD_PRESETS = [
  { id: 'budget', name: 'Budget Build', desc: 'Max performance per rupee', minPrice: 35000, maxPrice: 50000, action: 'buildpc' },
  { id: 'creator', name: 'Creator Build', desc: 'Streaming, edit, render', minPrice: 75000, maxPrice: 120000, action: 'buildpc' },
  { id: 'extreme', name: 'Extreme Gaming Build', desc: '4K, ray tracing, high FPS', minPrice: 120000, maxPrice: 250000, action: 'buildpc' },
];

export const DEALS_SECTIONS = [
  { id: 'daily', title: 'Daily Deals', endAt: 'today', stockAlert: true },
  { id: 'weekend', title: 'Weekend Gaming Deals', endAt: 'weekend', stockAlert: true },
  { id: 'gpu', title: 'GPU Flash Sale', endAt: 'flash', stockAlert: true },
  { id: 'laptop', title: 'Laptop Festival', endAt: 'festival', stockAlert: true },
];

export const GAMING_ZONE = {
  title: 'Unleash Next-Gen Gaming Power',
  subtitle: 'Gaming laptops, RTX GPUs, mechanical keyboards, gaming chairs, headsets.',
  categories: ['gaming-pcs', 'laptops', 'components', 'peripherals'],
};

export const BUSINESS_SOLUTIONS = {
  title: 'Business Solutions',
  subtitle: 'Workstations, servers, storage. For startups, design studios, video editors, developers.',
  packages: [
    { id: 'startup', name: 'Startups', desc: 'Scalable workstations & cloud-ready setups' },
    { id: 'design', name: 'Design Studios', desc: 'Color-accurate displays & high-end GPUs' },
    { id: 'video', name: 'Video Editors', desc: 'Fast storage, multi-core CPUs, pro monitors' },
    { id: 'dev', name: 'Developers', desc: 'Dev machines, servers, networking' },
  ],
  products: ['Workstations', 'Servers', 'Storage systems'],
};

export const CSR_SECTION = {
  title: 'TheValueStore Tech for Education',
  subtitle: 'We believe in tech that gives back.',
  programs: [
    { id: 'digital-class', name: 'Digital classrooms', desc: 'Devices and connectivity for schools' },
    { id: 'rural-coding', name: 'Rural coding labs', desc: 'Laptops and curriculum in underserved areas' },
    { id: 'women-tech', name: 'Women in tech scholarships', desc: 'Funding and mentorship for women in STEM' },
    { id: 'ewaste', name: 'E-waste recycling', desc: 'Responsible disposal and refurbishment' },
  ],
  impact: [
    { label: 'Schools supported', value: '250+' },
    { label: 'Devices donated', value: '12,000+' },
    { label: 'Scholarships', value: '500+' },
    { label: 'E-waste recycled (tonnes)', value: '45+' },
  ],
};
