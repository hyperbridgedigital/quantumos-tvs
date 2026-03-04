// TheValueStore — Computer & Gaming Product Catalog (300 test products)
// Categories: Laptops, Gaming PCs, PC Components, Gaming Gear, Displays, Networking, Accessories

import { buildProductCatalog } from './productCatalog';

const productCategories = {
  laptops: 'Laptops',
  gamingPcs: 'Gaming PCs',
  cpu: 'PC Components',
  gpu: 'PC Components',
  motherboard: 'PC Components',
  ram: 'PC Components',
  storage: 'PC Components',
  psu: 'PC Components',
  cooling: 'PC Components',
  cabinet: 'PC Components',
  keyboards: 'Gaming Gear',
  mouse: 'Gaming Gear',
  headsets: 'Gaming Gear',
  streaming: 'Gaming Gear',
  monitors: 'Displays',
  networking: 'Networking',
  accessories: 'Accessories',
  refurbished: 'Refurbished Value Deals',
};

// 300 products with high-res images (1200×1200) — Build Your PC & full catalog
export const menuItems = buildProductCatalog();

export const productCategoriesMap = productCategories;

// Rich metadata per category for landing pages
export const categoryLandingMeta = {
  laptops: {
    title: 'Laptops',
    subtitle: 'Gaming, creator & everyday laptops',
    description: 'From RTX gaming notebooks to thin-and-lights for work and study. We stock ASUS ROG, Lenovo Legion, HP Omen, Dell XPS, Acer Nitro, and MSI — with expert advice to match you to the right machine.',
    highlights: ['RTX 40-series gaming', 'Creator & student picks', '18-month warranty on select models', 'Same-day demo at store'],
    icon: '💻',
  },
  gamingPcs: {
    title: 'Gaming PCs',
    subtitle: 'Prebuilt rigs & custom builds',
    description: 'Ready-to-ship gaming desktops from budget RTX 4060 builds to extreme RTX 4090 systems. All builds are compatibility-checked and wattage-optimised.',
    highlights: ['Prebuilt & custom', 'Wattage & compatibility checked', 'FPS estimates', 'Add full build to cart'],
    icon: '🖥️',
  },
  cpu: {
    title: 'PC Components',
    subtitle: 'CPU, GPU, motherboard, RAM, storage',
    description: 'Build or upgrade with AMD Ryzen, Intel Core, NVIDIA RTX, and AMD Radeon. We help you pick the right CPU and GPU for gaming and content creation.',
    highlights: ['AMD & Intel CPUs', 'NVIDIA & AMD GPUs', 'DDR5 RAM & NVMe', 'Expert compatibility'],
    icon: '⚙️',
  },
  gpu: {
    title: 'Graphics Cards',
    subtitle: 'NVIDIA RTX & AMD Radeon',
    description: 'NVIDIA RTX 40-series and AMD Radeon RX 7000 — from 1080p value to 4K ultra. Ray tracing and AI-ready for gaming and creator workloads.',
    highlights: ['RTX 4060 to 4090', 'Radeon RX 7800 XT', 'Ray tracing & DLSS', 'Creator & AI workloads'],
    icon: '🎮',
  },
  monitors: {
    title: 'Monitors',
    subtitle: 'Gaming & creator displays',
    description: 'High refresh gaming (165Hz–240Hz), 4K creator panels, and OLED options. LG, ASUS ROG Swift, Dell UltraSharp — colour-accurate and fast response.',
    highlights: ['240Hz OLED gaming', '165Hz value picks', '4K creator', 'Multiple sizes'],
    icon: '🖥',
  },
  storage: {
    title: 'Storage',
    subtitle: 'NVMe SSDs & external drives',
    description: 'Samsung 990 Pro, WD Black SN850X, and external portables. Speed and capacity for games, projects, and backups.',
    highlights: ['Gen4 NVMe', '1TB & 2TB options', 'External SSD', 'Top benchmarks'],
    icon: '💾',
  },
  networking: {
    title: 'Networking',
    subtitle: 'WiFi 6 & mesh',
    description: 'TP-Link, Netgear Orbi, and more. Reliable WiFi and mesh systems for home and small office.',
    highlights: ['WiFi 6', 'Mesh systems', 'Easy setup', 'Stable connectivity'],
    icon: '📡',
  },
  keyboards: {
    title: 'Gaming & Accessories',
    subtitle: 'Keyboards, mouse, headsets, streaming',
    description: 'Mechanical keyboards, precision mice, gaming headsets, streaming gear, and creator accessories. Logitech, Razer, SteelSeries, Secretlab.',
    highlights: ['Mechanical keyboards', 'Headsets & audio', 'Streaming gear', 'Gaming chairs'],
    icon: '⌨️',
  },
  refurbished: {
    title: 'Refurbished Value Deals',
    subtitle: 'Certified pre-owned tech',
    description: 'Quality-checked refurbished laptops and desktops with warranty. Best value for students and secondary setups.',
    highlights: ['Certified refurbished', 'Warranty included', 'Student-friendly', 'Eco choice'],
    icon: '♻️',
  },
};

// Category slugs for quick grid (homepage)
export const quickCategories = [
  { key: 'laptops', label: 'Laptops', icon: '💻', shortDesc: 'Gaming & creator notebooks' },
  { key: 'gamingPcs', label: 'Gaming PCs', icon: '🖥️', shortDesc: 'Prebuilt & custom rigs' },
  { key: 'cpu', label: 'PC Components', icon: '⚙️', shortDesc: 'CPU, GPU, RAM, storage' },
  { key: 'monitors', label: 'Monitors', icon: '🖥', shortDesc: 'Gaming & 4K displays' },
  { key: 'storage', label: 'Storage', icon: '💾', shortDesc: 'NVMe & external SSD' },
  { key: 'networking', label: 'Networking', icon: '📡', shortDesc: 'WiFi 6 & mesh' },
  { key: 'keyboards', label: 'Accessories', icon: '⌨️', shortDesc: 'Keyboards, mouse, headsets' },
  { key: 'refurbished', label: 'Refurbished', icon: '♻️', shortDesc: 'Certified value deals' },
];
