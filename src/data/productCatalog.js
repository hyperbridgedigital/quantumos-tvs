// TheValueStore — 300 test products for Build Your PC & full catalog
// High-resolution images: 1200×1200 via picsum (deterministic per id)

const TAGS = ['Top Gaming Pick', 'Best Value', 'Creator Choice', null];

function imageUrl(id) {
  return `https://picsum.photos/seed/${encodeURIComponent(id)}/1200/1200`;
}

function pick(arr, i) {
  return arr[i % arr.length];
}

function deterministic(i, id, max = 100) {
  let h = 0;
  for (let j = 0; j < id.length; j++) h = (h * 31 + id.charCodeAt(j) + i) | 0;
  return Math.abs(h) % max / max;
}

function buildCategory(config) {
  const { prefix, category, skuPrefix, count, brands, names, priceMin, priceMax } = config;
  const out = [];
  for (let i = 1; i <= count; i++) {
    const id = `${prefix}${String(i).padStart(2, '0')}`;
    const name = typeof names === 'function' ? names(i) : pick(names, i - 1);
    const brand = pick(brands, i - 1);
    const t = deterministic(i, id);
    const price = Math.round(priceMin + (priceMax - priceMin) * t);
    const priceRounded = Math.round(price / 500) * 500;
    const rating = 4.3 + deterministic(i + 1, id, 60) / 100;
    out.push({
      id,
      name,
      price: priceRounded,
      category,
      tag: pick(TAGS, i - 1),
      sku: `TVS-${skuPrefix}-${String(i).padStart(3, '0')}`,
      brand,
      rating: Math.round(rating * 10) / 10,
      isVeg: true,
      image: imageUrl(id),
    });
  }
  return out;
}

export function buildProductCatalog() {
  const laptops = buildCategory({
    prefix: 'LAP', category: 'laptops', skuPrefix: 'LAP', count: 22,
    brands: ['ASUS', 'Lenovo', 'HP', 'Dell', 'Acer', 'MSI', 'Razer', 'Gigabyte'],
    names: (i) => [
      'ASUS ROG Strix G16 RTX 4060', 'Lenovo Legion 5 Pro Ryzen 7', 'HP Omen 16 Intel i7 RTX 4070',
      'Dell XPS 15 Creator Edition', 'Acer Nitro 5 RTX 4050', 'MSI Katana 15 RTX 4060',
      'Razer Blade 15 Base', 'Gigabyte Aorus 15', 'ASUS TUF Gaming A16', 'Lenovo IdeaPad Gaming 3',
      'HP Victus 16', 'Dell G15 5530', 'Acer Predator Helios', 'MSI Cyborg 15', 'ASUS Zenbook Pro',
      'Lenovo ThinkPad P16', 'HP Pavilion Gaming', 'Dell Inspiron 16 Plus', 'Acer Swift X',
      'MSI Prestige 14', 'ASUS VivoBook Pro', 'Lenovo Yoga 9i',
    ][i - 1] || `Gaming Laptop ${i}`,
    priceMin: 54990, priceMax: 199990,
  });

  const gamingPcs = buildCategory({
    prefix: 'PC', category: 'gamingPcs', skuPrefix: 'PC', count: 18,
    brands: ['TheValueStore', 'TheValueStore', 'TheValueStore', 'iBUYPOWER', 'Skytech', 'CyberPowerPC'],
    names: (i) => [
      'Prebuilt RTX 4070 Ti Gaming Rig', 'Budget Gaming PC RTX 4060', 'Extreme RTX 4090 Build',
      'Starter RTX 4050 Build', 'Prosumer RTX 4080 Rig', 'Streaming PC RTX 4070',
      'Compact SFF RTX 4060 Ti', 'RGB Elite RTX 4070 Super', 'Silent Pro RTX 4080',
      'Creator Workstation RTX 4090', 'Value RTX 4060 1080p', 'High Refresh RTX 4070',
      '4K Ready RTX 4080 Super', 'Esports RTX 4060', 'Max FPS RTX 4090', 'Mid Tower RTX 4070',
      'Mini PC RTX 4060', 'Custom Loop RTX 4080',
    ][i - 1] || `Gaming PC ${i}`,
    priceMin: 64990, priceMax: 349990,
  });

  const cpuNames = (i) => [
    'AMD Ryzen 7 7800X3D', 'Intel Core i7-14700K', 'AMD Ryzen 5 7600', 'Intel Core i5-14600K',
    'AMD Ryzen 9 7950X3D', 'Intel Core i9-14900K', 'AMD Ryzen 5 7600X', 'Intel Core i5-13400F',
    'AMD Ryzen 7 7700X', 'Intel Core i7-13700K', 'AMD Ryzen 9 7900X', 'Intel Core i9-13900K',
    'AMD Ryzen 5 5600X', 'Intel Core i5-12400F', 'AMD Ryzen 7 5800X3D', 'Intel Core i7-12700K',
    'AMD Ryzen 9 5950X', 'Intel Core i9-12900K', 'AMD Ryzen 7 5700X', 'Intel Core i5-13600K',
    'AMD Ryzen 5 7500F', 'Intel Core i3-14100F',
  ][i - 1] || `Processor ${i}`;
  const cpus = buildCategory({
    prefix: 'CPU', category: 'cpu', skuPrefix: 'CPU', count: 22,
    brands: ['AMD', 'Intel', 'AMD', 'Intel', 'AMD', 'Intel'],
    names: cpuNames,
    priceMin: 12990, priceMax: 62990,
  });

  const gpuNames = (i) => [
    'NVIDIA RTX 4070 Super 12GB', 'NVIDIA RTX 4060 Ti 8GB', 'NVIDIA RTX 4080 Super',
    'AMD Radeon RX 7800 XT', 'NVIDIA RTX 4090 24GB', 'NVIDIA RTX 4060 8GB',
    'AMD Radeon RX 7700 XT', 'NVIDIA RTX 4070 12GB', 'AMD Radeon RX 7900 XTX',
    'NVIDIA RTX 4080 16GB', 'AMD Radeon RX 7600', 'NVIDIA RTX 4050 6GB',
    'NVIDIA RTX 3090 Ti', 'AMD Radeon RX 6950 XT', 'NVIDIA RTX 3080 12GB',
    'AMD Radeon RX 6750 XT', 'NVIDIA RTX 3070 Ti', 'AMD Radeon RX 6700 XT',
    'NVIDIA RTX 3060 Ti', 'AMD Radeon RX 6600 XT', 'NVIDIA RTX 3050',
    'AMD Radeon RX 6500 XT', 'NVIDIA RTX 4070 Ti Super', 'Intel Arc A770',
    'NVIDIA RTX 3090', 'AMD Radeon RX 7900 XT', 'NVIDIA RTX 3080 Ti', 'AMD Radeon RX 6800 XT',
  ][i - 1] || `Graphics Card ${i}`;
  const gpus = buildCategory({
    prefix: 'GPU', category: 'gpu', skuPrefix: 'GPU', count: 27,
    brands: ['NVIDIA', 'AMD', 'NVIDIA', 'AMD', 'NVIDIA', 'Intel', 'ASUS', 'MSI', 'Gigabyte'],
    names: gpuNames,
    priceMin: 24990, priceMax: 179990,
  });

  const mbNames = (i) => [
    'ASUS ROG Strix B650E-F', 'MSI MAG B760M Mortar WiFi', 'Gigabyte B650 AORUS Elite',
    'ASUS TUF Z790-Plus', 'MSI MPG B650 Carbon', 'ASRock B760M Pro RS',
    'ASUS ROG Maximus Z790', 'MSI MEG X670E Ace', 'Gigabyte Z690 AORUS Master',
    'ASUS Prime B660M-A', 'MSI Pro B650-P WiFi', 'Gigabyte B760M DS3H',
    'ASUS ROG Strix X670E-E', 'MSI MAG B550 Tomahawk', 'ASRock X670E Taichi',
    'ASUS TUF Gaming B550-Plus', 'MSI MPG X570 Gaming Plus', 'Gigabyte X670E AORUS Master',
    'ASUS Prime X670-P', 'MSI Pro Z690-A WiFi', 'Gigabyte B550M AORUS Elite',
    'ASUS ROG Crosshair X670E', 'MSI MAG Z790 Tomahawk', 'ASRock B650E Steel Legend',
    'ASUS TUF Gaming B650-Plus', 'MSI B650M Project Zero', 'Gigabyte Z790 AORUS Elite',
    'ASUS ROG Strix B550-F',
  ][i - 1] || `Motherboard ${i}`;
  const motherboards = buildCategory({
    prefix: 'MB', category: 'motherboard', skuPrefix: 'MB', count: 27,
    brands: ['ASUS', 'MSI', 'Gigabyte', 'ASRock', 'ASUS', 'MSI'],
    names: mbNames,
    priceMin: 11990, priceMax: 44990,
  });

  const ramNames = (i) => [
    'Corsair Vengeance 32GB DDR5 5600', 'G.Skill Trident Z5 RGB 32GB DDR5', 'Kingston FURY Beast 32GB DDR5',
    'Corsair Dominator 64GB DDR5', 'G.Skill Ripjaws S5 32GB DDR5', 'Teamgroup T-Force 32GB DDR5',
    'Corsair Vengeance RGB 16GB DDR5', 'G.Skill Flare X5 32GB DDR5', 'Kingston FURY Renegade 32GB',
    'Corsair Vengeance 64GB DDR5 5200', 'G.Skill Trident Z5 64GB DDR5', 'Teamgroup Delta 32GB DDR5 RGB',
    'Corsair Vengeance LPX 32GB DDR4', 'G.Skill Ripjaws V 32GB DDR4', 'Kingston FURY Beast 16GB DDR5',
    'Corsair Dominator Platinum 32GB', 'G.Skill Trident Z5 Neo 32GB', 'Teamgroup Vulcan 32GB DDR5',
    'Corsair Vengeance 32GB DDR4 3600', 'G.Skill Flare X5 64GB DDR5', 'Kingston FURY Impact 32GB',
    'Corsair Vengeance RGB 32GB DDR5', 'G.Skill Trident Z5 32GB 6000',
  ][i - 1] || `RAM Kit ${i}`;
  const rams = buildCategory({
    prefix: 'RAM', category: 'ram', skuPrefix: 'RAM', count: 22,
    brands: ['Corsair', 'G.Skill', 'Kingston', 'Teamgroup', 'Corsair', 'G.Skill'],
    names: ramNames,
    priceMin: 4990, priceMax: 24990,
  });

  const storageNames = (i) => [
    'Samsung 990 Pro 1TB NVMe', 'WD Black SN850X 2TB', 'Samsung 980 Pro 2TB',
    'Crucial P5 Plus 1TB', 'Kingston KC3000 2TB', 'WD Black SN770 1TB',
    'Samsung 990 Pro 2TB', 'Sabrent Rocket 4 Plus 1TB', 'Corsair MP600 Pro 2TB',
    'Teamgroup Cardea A440 1TB', 'Crucial T700 2TB Gen5', 'Samsung 870 EVO 2TB SATA',
    'WD Blue SN580 1TB', 'Kingston NV2 2TB', 'Samsung 980 1TB', 'WD Black SN850X 1TB',
    'Corsair MP600 1TB', 'Sabrent Rocket 2TB', 'Teamgroup MP44L 2TB',
    'Crucial P3 Plus 2TB', 'Kingston NV2 1TB', 'Samsung 990 Pro 4TB',
  ][i - 1] || `SSD ${i}`;
  const storages = buildCategory({
    prefix: 'SSD', category: 'storage', skuPrefix: 'SSD', count: 22,
    brands: ['Samsung', 'WD', 'Crucial', 'Kingston', 'Corsair', 'Sabrent', 'Teamgroup'],
    names: storageNames,
    priceMin: 4990, priceMax: 28990,
  });

  const psuNames = (i) => [
    'Corsair RM750e 750W 80+ Gold', 'Corsair RM850e 850W 80+ Gold', 'Corsair RM1000e 1000W 80+ Gold',
    'Seasonic Focus GX-750', 'be quiet! Straight Power 11 850W', 'EVGA SuperNOVA 750 G6',
    'Corsair RM850x 850W', 'Seasonic Prime TX-1000', 'be quiet! Dark Power 12 1000W',
    'EVGA 850 G6', 'Corsair RM1000x', 'Seasonic Focus GX-850', 'be quiet! Pure Power 12 750W',
    'Corsair SF750 Platinum', 'Seasonic Prime PX-850', 'EVGA 1000 G6',
    'Corsair RM650e', 'Seasonic Focus GX-1000', 'be quiet! Straight Power 11 750W',
  ][i - 1] || `PSU ${i}`;
  const psus = buildCategory({
    prefix: 'PSU', category: 'psu', skuPrefix: 'PSU', count: 18,
    brands: ['Corsair', 'Seasonic', 'be quiet!', 'EVGA', 'Corsair', 'Seasonic'],
    names: psuNames,
    priceMin: 5990, priceMax: 19990,
  });

  const coolingNames = (i) => [
    'Noctua NH-D15 Chromax', 'Cooler Master Hyper 212', 'Noctua NH-U12A',
    'be quiet! Dark Rock Pro 4', 'Arctic Liquid Freezer II 280', 'Corsair iCUE H150i',
    'Cooler Master MasterLiquid ML240', 'Noctua NH-L9a', 'be quiet! Dark Rock 4',
    'Arctic Freezer 34', 'Corsair H100i Elite', 'NZXT Kraken X63',
    'Cooler Master Hyper 212 RGB', 'Noctua NH-D15S', 'be quiet! Pure Rock 2',
    'Arctic Liquid Freezer II 360', 'Corsair iCUE H100i', 'NZXT Kraken Z63',
    'Cooler Master ML360 Illusion', 'Deepcool AK620',
  ][i - 1] || `Cooler ${i}`;
  const coolings = buildCategory({
    prefix: 'COOL', category: 'cooling', skuPrefix: 'COOL', count: 18,
    brands: ['Noctua', 'Cooler Master', 'be quiet!', 'Arctic', 'Corsair', 'NZXT', 'Deepcool'],
    names: coolingNames,
    priceMin: 2490, priceMax: 14990,
  });

  const cabinetNames = (i) => [
    'Lian Li O11 Dynamic EVO', 'NZXT H5 Flow Mid Tower', 'Corsair 4000D Airflow',
    'Lian Li Lancool 216', 'NZXT H7 Flow', 'Fractal Design Torrent',
    'Corsair 5000D', 'Lian Li O11 Air Mini', 'NZXT H9 Flow', 'Phanteks Eclipse G360A',
    'Corsair 3000D', 'Fractal Design North', 'Lian Li Lancool III', 'NZXT H510 Flow',
    'Corsair 2500D', 'Phanteks NV5', 'Fractal Design Pop Air', 'Lian Li O11 Dynamic Mini',
  ][i - 1] || `Case ${i}`;
  const cabinets = buildCategory({
    prefix: 'CAB', category: 'cabinet', skuPrefix: 'CAB', count: 18,
    brands: ['Lian Li', 'NZXT', 'Corsair', 'Fractal Design', 'Phanteks', 'Lian Li', 'NZXT'],
    names: cabinetNames,
    priceMin: 4990, priceMax: 19990,
  });

  const monitorNames = (i) => [
    'LG 27" 240Hz OLED Gaming', 'ASUS ROG Swift 27" 165Hz', 'Dell UltraSharp 4K 32"',
    'Samsung Odyssey G7 32"', 'LG 32GP850 165Hz', 'ASUS ProArt PA279CV',
    'Dell S2722DGM 165Hz', 'Gigabyte M28U 4K 144Hz', 'MSI MAG 274QRF 165Hz',
    'Samsung Odyssey Neo G8', 'LG 34WP85C UltraWide', 'ASUS ROG Swift PG32UQ',
    'Dell Alienware AW2724DM', 'Gigabyte G27Q 144Hz', 'MSI G274QPF 170Hz',
    'Samsung ViewFinity S8', 'LG 27UK850 4K', 'ASUS TUF VG27AQ', 'Dell P2723DE',
    'Gigabyte M27Q 170Hz', 'MSI MAG 321URX QD-OLED', 'Samsung Odyssey G5 27"',
  ][i - 1] || `Monitor ${i}`;
  const monitors = buildCategory({
    prefix: 'MON', category: 'monitors', skuPrefix: 'MON', count: 22,
    brands: ['LG', 'ASUS', 'Dell', 'Samsung', 'Gigabyte', 'MSI'],
    names: monitorNames,
    priceMin: 14990, priceMax: 89990,
  });

  const kbNames = (i) => [
    'Logitech G Pro X Mechanical', 'Razer BlackWidow V4', 'SteelSeries Apex Pro',
    'Corsair K70 RGB TKL', 'Keychron K8 Pro', 'Razer Huntsman V2',
    'Logitech G915 TKL', 'SteelSeries Apex 7', 'Corsair K65 RGB Mini',
    'Keychron Q1 Pro', 'Razer DeathStalker V2', 'Logitech MX Mechanical',
    'SteelSeries Apex 5', 'Corsair K100', 'Keychron K2', 'Razer Ornata V3',
  ][i - 1] || `Keyboard ${i}`;
  const keyboards = buildCategory({
    prefix: 'KB', category: 'keyboards', skuPrefix: 'KB', count: 14,
    brands: ['Logitech', 'Razer', 'SteelSeries', 'Corsair', 'Keychron'],
    names: kbNames,
    priceMin: 4990, priceMax: 19990,
  });

  const mouseNames = (i) => [
    'Logitech G502 X Lightspeed', 'Razer DeathAdder V3', 'SteelSeries Rival 5',
    'Logitech G Pro X Superlight', 'Razer Viper V3 Pro', 'Corsair Sabre RGB',
    'SteelSeries Aerox 3', 'Logitech G703', 'Razer Basilisk V3',
    'Corsair M65 RGB Ultra', 'Logitech MX Master 3S', 'Razer Naga V2 Pro',
  ][i - 1] || `Mouse ${i}`;
  const mouses = buildCategory({
    prefix: 'MOU', category: 'mouse', skuPrefix: 'MOU', count: 10,
    brands: ['Logitech', 'Razer', 'SteelSeries', 'Corsair'],
    names: mouseNames,
    priceMin: 2990, priceMax: 14990,
  });

  const headsetNames = (i) => [
    'SteelSeries Arctis Nova Pro', 'Razer BlackShark V2 Pro', 'Logitech G Pro X 2',
    'Corsair Virtuoso Pro', 'SteelSeries Arctis 7+', 'Razer Barracuda Pro',
    'Logitech G735', 'Corsair HS80 RGB', 'SteelSeries Arctis Nova 3',
    'Razer Kraken V3 HyperSense', 'Logitech G535', 'Corsair HS65',
  ][i - 1] || `Headset ${i}`;
  const headsets = buildCategory({
    prefix: 'HS', category: 'headsets', skuPrefix: 'HS', count: 10,
    brands: ['SteelSeries', 'Razer', 'Logitech', 'Corsair'],
    names: headsetNames,
    priceMin: 4990, priceMax: 29990,
  });

  const streamingNames = (i) => [
    'Secretlab Titan Evo 2022', 'Elgato Stream Deck MK.2', 'Blue Yeti X',
    'Elgato Key Light Mini', 'Rode NT-USB Mini', 'Elgato Facecam',
  ][i - 1] || `Streaming Gear ${i}`;
  const streamings = buildCategory({
    prefix: 'STR', category: 'streaming', skuPrefix: 'STR', count: 6,
    brands: ['Secretlab', 'Elgato', 'Blue', 'Rode'],
    names: streamingNames,
    priceMin: 4990, priceMax: 59990,
  });

  const netNames = (i) => [
    'TP-Link Archer AX73 WiFi 6', 'Netgear Orbi Mesh RBK752', 'ASUS ROG Rapture GT-AXE11000',
    'TP-Link Deco X60 Mesh', 'Netgear Nighthawk RAX50', 'ASUS ZenWiFi Pro XT12',
    'TP-Link Archer AX50', 'Netgear Orbi RBR750', 'ASUS RT-AX86U',
    'TP-Link RE605X Range Extender', 'Netgear Nighthawk AX12', 'ASUS ROG Rapture GT-AX6000',
  ][i - 1] || `Networking ${i}`;
  const networkings = buildCategory({
    prefix: 'NET', category: 'networking', skuPrefix: 'NET', count: 10,
    brands: ['TP-Link', 'Netgear', 'ASUS'],
    names: netNames,
    priceMin: 3990, priceMax: 34990,
  });

  const accNames = (i) => [
    'CalDigit TS4 Thunderbolt 4 Dock', 'Logitech C920 Pro Webcam', 'Samsung T7 2TB External SSD',
    'Anker PowerExpand 8-in-1', 'Elgato Cam Link 4K', 'Blue Yeti Nano',
    'Samsung T9 4TB Portable SSD', 'Anker 767 PowerStation', 'Elgato Wave:3',
    'Logitech Brio 4K', 'WD My Passport 4TB', 'Anker 7-in-1 Hub',
  ][i - 1] || `Accessory ${i}`;
  const accessories = buildCategory({
    prefix: 'ACC', category: 'accessories', skuPrefix: 'ACC', count: 10,
    brands: ['CalDigit', 'Logitech', 'Samsung', 'Anker', 'Elgato', 'WD'],
    names: accNames,
    priceMin: 3990, priceMax: 39990,
  });

  const refNames = (i) => [
    'Refurbished Lenovo IdeaPad Gaming', 'Refurbished Dell OptiPlex SFF', 'Refurbished HP Pavilion',
    'Refurbished ASUS Vivobook', 'Refurbished Acer Aspire', 'Refurbished Dell Latitude',
    'Refurbished Lenovo ThinkPad', 'Refurbished HP EliteDesk',
  ][i - 1] || `Refurbished ${i}`;
  const refurbished = buildCategory({
    prefix: 'REF', category: 'refurbished', skuPrefix: 'REF', count: 8,
    brands: ['Lenovo', 'Dell', 'HP', 'ASUS', 'Acer'],
    names: refNames,
    priceMin: 19990, priceMax: 54990,
  });

  return [
    ...laptops,
    ...gamingPcs,
    ...cpus,
    ...gpus,
    ...motherboards,
    ...rams,
    ...storages,
    ...psus,
    ...coolings,
    ...cabinets,
    ...monitors,
    ...keyboards,
    ...mouses,
    ...headsets,
    ...streamings,
    ...networkings,
    ...accessories,
    ...refurbished,
  ];
}
