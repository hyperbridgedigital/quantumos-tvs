/**
 * PC parts catalog for Build-a-PC configurator.
 * Each part includes specs needed for live compatibility, bottleneck, thermal, and PSU calculations.
 */

export const PART_CATEGORIES = [
  { id: 'cpu', label: 'Processor', icon: '⚡', required: true },
  { id: 'motherboard', label: 'Motherboard', icon: '🔌', required: true },
  { id: 'gpu', label: 'Graphics Card', icon: '🎮', required: false },
  { id: 'ram', label: 'Memory', icon: '📦', required: true },
  { id: 'storage', label: 'Storage', icon: '💾', required: true },
  { id: 'psu', label: 'Power Supply', icon: '🔋', required: true },
  { id: 'case', label: 'Case', icon: '🖥️', required: true },
  { id: 'cooler', label: 'CPU Cooler', icon: '❄️', required: false },
];

export const USE_CASE_PRESETS = [
  { id: 'gaming_1080p', label: 'Gaming 1080p', budgetMin: 45000, budgetMax: 75000, focus: 'fps', resolution: '1080p' },
  { id: 'gaming_1440p', label: 'Gaming 1440p', budgetMin: 75000, budgetMax: 120000, focus: 'fps', resolution: '1440p' },
  { id: 'gaming_4k', label: 'Gaming 4K', budgetMin: 120000, budgetMax: 250000, focus: 'fps', resolution: '4k' },
  { id: 'streaming', label: 'Streaming + Gaming', budgetMin: 90000, budgetMax: 150000, focus: 'balanced' },
  { id: 'workstation', label: 'Workstation / Creator', budgetMin: 100000, budgetMax: 300000, focus: 'cpu' },
  { id: 'sff', label: 'Small Form Factor', budgetMin: 60000, budgetMax: 140000, focus: 'size' },
  { id: 'silent', label: 'Silent / Quiet', budgetMin: 70000, budgetMax: 130000, focus: 'noise' },
  { id: 'budget', label: 'Max Value', budgetMin: 35000, budgetMax: 55000, focus: 'value' },
];

export const AESTHETIC_FILTERS = [
  { id: 'any', label: 'Any' },
  { id: 'rgb', label: 'RGB / Gaming' },
  { id: 'blackout', label: 'Blackout' },
  { id: 'white', label: 'White Build' },
  { id: 'minimal', label: 'Minimal' },
];

export const FORM_FACTORS = [
  { id: 'atx', label: 'ATX', desc: 'Full tower / mid' },
  { id: 'matx', label: 'Micro-ATX', desc: 'Compact' },
  { id: 'itx', label: 'Mini-ITX', desc: 'SFF' },
];

// PSU tier (quality) — affects recommendations
export const PSU_TIERS = { A: 'Gold', B: 'Bronze+', C: 'Basic' };

export const pcParts = [
  // ─── CPUs ───
  { id: 'cpu_1', name: 'AMD Ryzen 5 7600', category: 'cpu', price: 18999, brand: 'AMD', socket: 'AM5', tdp: 65, cores: 6, threads: 12, ramMaxSpeed: 5200, pcie: 'Gen5', releaseYear: 2023, warranty: 3, inStock: true, tier: 'mid', fps1080: 142, fps1440: 118, fps4k: 78, noise: 28, futureProof: 8, pros: ['AM5 longevity', 'DDR5', 'efficient'], cons: ['No iGPU in 7600X'], guideUrl: 'https://example.com/install-cpu' },
  { id: 'cpu_2', name: 'AMD Ryzen 7 7800X3D', category: 'cpu', price: 38999, brand: 'AMD', socket: 'AM5', tdp: 120, cores: 8, threads: 16, ramMaxSpeed: 5200, pcie: 'Gen5', releaseYear: 2023, warranty: 3, inStock: true, tier: 'high', fps1080: 198, fps1440: 165, fps4k: 112, noise: 35, futureProof: 9, pros: ['Best gaming', '3D V-Cache'], cons: ['Higher TDP'], guideUrl: 'https://example.com/install-cpu' },
  { id: 'cpu_3', name: 'Intel Core i5-14600K', category: 'cpu', price: 27999, brand: 'Intel', socket: 'LGA1700', tdp: 125, cores: 14, threads: 20, ramMaxSpeed: 5600, pcie: 'Gen5', releaseYear: 2024, warranty: 3, inStock: true, tier: 'mid', fps1080: 155, fps1440: 128, fps4k: 85, noise: 38, futureProof: 6, pros: ['Strong multi-thread', 'DDR5'], cons: ['Platform EOL soon'], guideUrl: 'https://example.com/install-cpu' },
  { id: 'cpu_4', name: 'Intel Core i7-14700K', category: 'cpu', price: 42999, brand: 'Intel', socket: 'LGA1700', tdp: 125, cores: 20, threads: 28, ramMaxSpeed: 5600, pcie: 'Gen5', releaseYear: 2024, warranty: 3, inStock: true, tier: 'high', fps1080: 168, fps1440: 138, fps4k: 92, noise: 42, futureProof: 6, pros: ['Creator + gaming'], cons: ['Hot'], guideUrl: 'https://example.com/install-cpu' },
  { id: 'cpu_5', name: 'AMD Ryzen 5 5600', category: 'cpu', price: 12999, brand: 'AMD', socket: 'AM4', tdp: 65, cores: 6, threads: 12, ramMaxSpeed: 3200, pcie: 'Gen4', releaseYear: 2022, warranty: 3, inStock: true, tier: 'budget', fps1080: 118, fps1440: 95, fps4k: 62, noise: 26, futureProof: 4, pros: ['Cheap', 'AM4 boards'], cons: ['DDR4 only'], guideUrl: 'https://example.com/install-cpu' },
  // ─── Motherboards ───
  { id: 'mb_1', name: 'ASUS ROG Strix B650E-F', category: 'motherboard', price: 24999, brand: 'ASUS', socket: 'AM5', formFactor: 'atx', ramSlots: 4, ramMax: 128, pcieSlots: 2, m2Slots: 3, psuTier: 'A', warranty: 3, inStock: true, aesthetic: 'rgb', releaseYear: 2023 },
  { id: 'mb_2', name: 'MSI MAG B650M Mortar', category: 'motherboard', price: 18999, brand: 'MSI', socket: 'AM5', formFactor: 'matx', ramSlots: 4, ramMax: 128, pcieSlots: 2, m2Slots: 2, psuTier: 'A', warranty: 3, inStock: true, aesthetic: 'blackout', releaseYear: 2023 },
  { id: 'mb_3', name: 'Gigabyte B760M DS3H', category: 'motherboard', price: 11999, brand: 'Gigabyte', socket: 'LGA1700', formFactor: 'matx', ramSlots: 4, ramMax: 128, pcieSlots: 2, m2Slots: 2, psuTier: 'B', warranty: 3, inStock: true, aesthetic: 'minimal', releaseYear: 2023 },
  { id: 'mb_4', name: 'ASRock B650E PG ITX', category: 'motherboard', price: 27999, brand: 'ASRock', socket: 'AM5', formFactor: 'itx', ramSlots: 2, ramMax: 64, pcieSlots: 1, m2Slots: 2, psuTier: 'A', warranty: 3, inStock: true, aesthetic: 'blackout', releaseYear: 2023 },
  { id: 'mb_5', name: 'ASUS TUF B550-Plus', category: 'motherboard', price: 13999, brand: 'ASUS', socket: 'AM4', formFactor: 'atx', ramSlots: 4, ramMax: 128, pcieSlots: 2, m2Slots: 2, psuTier: 'B', warranty: 3, inStock: true, aesthetic: 'blackout', releaseYear: 2022 },
  // ─── GPUs ───
  { id: 'gpu_1', name: 'NVIDIA RTX 4060 8GB', category: 'gpu', price: 28999, brand: 'NVIDIA', watts: 115, length: 240, slots: 2, pcie: 'Gen4', warranty: 3, inStock: true, tier: 'mid', fps1080: 132, fps1440: 98, fps4k: 52, noise: 32, releaseYear: 2023 },
  { id: 'gpu_2', name: 'NVIDIA RTX 4070 Super 12GB', category: 'gpu', price: 54999, brand: 'NVIDIA', watts: 220, length: 244, slots: 2, pcie: 'Gen4', warranty: 3, inStock: true, tier: 'high', fps1080: 178, fps1440: 142, fps4k: 82, noise: 35, releaseYear: 2024 },
  { id: 'gpu_3', name: 'NVIDIA RTX 4080 Super 16GB', category: 'gpu', price: 104999, brand: 'NVIDIA', watts: 320, length: 304, slots: 2, pcie: 'Gen4', warranty: 3, inStock: true, tier: 'high', fps1080: 212, fps1440: 178, fps4k: 118, noise: 38, releaseYear: 2024 },
  { id: 'gpu_4', name: 'AMD RX 7600 8GB', category: 'gpu', price: 24999, brand: 'AMD', watts: 165, length: 204, slots: 2, pcie: 'Gen4', warranty: 3, inStock: true, tier: 'mid', fps1080: 125, fps1440: 92, fps4k: 48, noise: 34, releaseYear: 2023 },
  { id: 'gpu_5', name: 'AMD RX 7800 XT 16GB', category: 'gpu', price: 49999, brand: 'AMD', watts: 263, length: 267, slots: 2, pcie: 'Gen4', warranty: 3, inStock: true, tier: 'high', fps1080: 165, fps1440: 132, fps4k: 78, noise: 36, releaseYear: 2023 },
  { id: 'gpu_6', name: 'NVIDIA RTX 5060 8GB', category: 'gpu', price: 34999, brand: 'NVIDIA', watts: 130, length: 228, slots: 2, pcie: 'Gen5', warranty: 3, inStock: true, tier: 'mid', fps1080: 148, fps1440: 112, fps4k: 58, noise: 30, releaseYear: 2025 },
  // ─── RAM ───
  { id: 'ram_1', name: 'Corsair Vengeance 32GB DDR5 5600', category: 'ram', price: 8999, brand: 'Corsair', speed: 5600, capacity: 32, sticks: 2, watts: 5, warranty: 5, inStock: true, aesthetic: 'rgb', am5SweetSpot: true },
  { id: 'ram_2', name: 'G.Skill Trident Z5 32GB DDR5 6000', category: 'ram', price: 11999, brand: 'G.Skill', speed: 6000, capacity: 32, sticks: 2, watts: 6, warranty: 5, inStock: true, aesthetic: 'rgb', am5SweetSpot: true },
  { id: 'ram_3', name: 'Kingston FURY 32GB DDR5 5200', category: 'ram', price: 7499, brand: 'Kingston', speed: 5200, capacity: 32, sticks: 2, watts: 5, warranty: 5, inStock: true, aesthetic: 'minimal', am5SweetSpot: false },
  { id: 'ram_4', name: 'Corsair Vengeance 16GB DDR4 3200', category: 'ram', price: 3999, brand: 'Corsair', speed: 3200, capacity: 16, sticks: 2, watts: 4, warranty: 5, inStock: true, aesthetic: 'blackout', ddr4: true },
  { id: 'ram_5', name: 'G.Skill Ripjaws 64GB DDR5 5600', category: 'ram', price: 18999, brand: 'G.Skill', speed: 5600, capacity: 64, sticks: 2, watts: 8, warranty: 5, inStock: true, aesthetic: 'blackout', am5SweetSpot: true },
  // ─── Storage ───
  { id: 'st_1', name: 'Samsung 990 Pro 1TB Gen4', category: 'storage', price: 10999, brand: 'Samsung', capacity: 1000, formFactor: 'M.2', gen: 4, watts: 7, warranty: 5, inStock: true, tier: 'A' },
  { id: 'st_2', name: 'WD Black SN850X 1TB Gen4', category: 'storage', price: 9999, brand: 'WD', capacity: 1000, formFactor: 'M.2', gen: 4, watts: 6, warranty: 5, inStock: true, tier: 'A' },
  { id: 'st_3', name: 'Crucial T500 1TB Gen4', category: 'storage', price: 7499, brand: 'Crucial', capacity: 1000, formFactor: 'M.2', gen: 4, watts: 6, warranty: 5, inStock: true, tier: 'B' },
  { id: 'st_4', name: 'Samsung 990 Pro 2TB Gen4', category: 'storage', price: 19999, brand: 'Samsung', capacity: 2000, formFactor: 'M.2', gen: 4, watts: 8, warranty: 5, inStock: true, tier: 'A' },
  { id: 'st_5', name: 'Kingston NV2 500GB Gen4', category: 'storage', price: 3499, brand: 'Kingston', capacity: 500, formFactor: 'M.2', gen: 4, watts: 4, warranty: 3, inStock: true, tier: 'C' },
  // ─── PSU ───
  { id: 'psu_1', name: 'Corsair RM750e 750W 80+ Gold', category: 'psu', price: 7999, brand: 'Corsair', watts: 750, efficiency: '80+ Gold', tier: 'A', warranty: 7, modular: true, inStock: true },
  { id: 'psu_2', name: 'Seasonic Focus GX-850 850W', category: 'psu', price: 10999, brand: 'Seasonic', watts: 850, efficiency: '80+ Gold', tier: 'A', warranty: 10, modular: true, inStock: true },
  { id: 'psu_3', name: 'Cooler Master MWE 650 Bronze', category: 'psu', price: 4999, brand: 'Cooler Master', watts: 650, efficiency: '80+ Bronze', tier: 'B', warranty: 5, modular: false, inStock: true },
  { id: 'psu_4', name: 'Corsair SF750 750W SFX', category: 'psu', price: 12999, brand: 'Corsair', watts: 750, efficiency: '80+ Platinum', tier: 'A', warranty: 7, modular: true, sfx: true, inStock: true },
  { id: 'psu_5', name: 'be quiet! Straight Power 11 1000W', category: 'psu', price: 14999, brand: 'be quiet!', watts: 1000, efficiency: '80+ Gold', tier: 'A', warranty: 10, modular: true, inStock: true },
  // ─── Cases ───
  { id: 'case_1', name: 'Lian Li O11 Dynamic EVO', category: 'case', price: 14999, brand: 'Lian Li', formFactor: 'atx', gpuMaxLength: 420, coolerMaxHeight: 167, radSupport: 360, aesthetic: 'rgb', warranty: 2, inStock: true, volume: 45 },
  { id: 'case_2', name: 'NZXT H5 Flow', category: 'case', price: 6999, brand: 'NZXT', formFactor: 'atx', gpuMaxLength: 365, coolerMaxHeight: 165, radSupport: 280, aesthetic: 'minimal', warranty: 2, inStock: true, volume: 38 },
  { id: 'case_3', name: 'Fractal Design North', category: 'case', price: 9999, brand: 'Fractal', formFactor: 'atx', gpuMaxLength: 355, coolerMaxHeight: 170, radSupport: 360, aesthetic: 'minimal', warranty: 2, inStock: true, volume: 41 },
  { id: 'case_4', name: 'Cooler Master NR200P', category: 'case', price: 6499, brand: 'Cooler Master', formFactor: 'itx', gpuMaxLength: 330, coolerMaxHeight: 155, radSupport: 280, aesthetic: 'minimal', warranty: 2, inStock: true, volume: 18, sfxOnly: false },
  { id: 'case_5', name: 'Hyte Y60', category: 'case', price: 12999, brand: 'Hyte', formFactor: 'atx', gpuMaxLength: 375, coolerMaxHeight: 160, radSupport: 360, aesthetic: 'rgb', warranty: 2, inStock: true, volume: 42 },
  // ─── Coolers ───
  { id: 'cooler_1', name: 'Noctua NH-D15', category: 'cooler', price: 7999, brand: 'Noctua', height: 165, tdpRating: 250, noise: 24, warranty: 6, inStock: true, type: 'tower' },
  { id: 'cooler_2', name: 'Deepcool AK620', category: 'cooler', price: 4999, brand: 'Deepcool', height: 160, tdpRating: 260, noise: 28, warranty: 5, inStock: true, type: 'tower' },
  { id: 'cooler_3', name: 'Arctic Liquid Freezer II 280', category: 'cooler', price: 8999, brand: 'Arctic', height: 0, tdpRating: 250, noise: 26, warranty: 6, inStock: true, type: 'aio', radSize: 280 },
  { id: 'cooler_4', name: 'Thermalright Phantom Spirit', category: 'cooler', price: 3499, brand: 'Thermalright', height: 154, tdpRating: 245, noise: 25, warranty: 6, inStock: true, type: 'tower' },
  { id: 'cooler_5', name: 'Noctua NH-L9a (Low Profile)', category: 'cooler', price: 4499, brand: 'Noctua', height: 37, tdpRating: 65, noise: 23, warranty: 6, inStock: true, type: 'lowprofile' },
];

export function getPartsByCategory(category) {
  return pcParts.filter((p) => p.category === category);
}

export function getPartById(id) {
  return pcParts.find((p) => p.id === id);
}
