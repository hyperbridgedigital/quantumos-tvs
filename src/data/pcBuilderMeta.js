// PC Builder — compatibility & wattage metadata per product id
// Used by frontend builder for live compatibility check and PSU recommendation
// Generated for 300-product catalog (all builder-relevant IDs)

export const BUILDER_STEP_ORDER = [
  'cpu', 'motherboard', 'ram', 'gpu', 'storage', 'psu', 'cooling', 'cabinet',
];

export const BUILDER_STEP_LABELS = {
  cpu: 'Processor (CPU)',
  motherboard: 'Motherboard',
  ram: 'Memory (RAM)',
  gpu: 'Graphics (GPU)',
  storage: 'Storage',
  psu: 'Power Supply (PSU)',
  cooling: 'CPU Cooler',
  cabinet: 'Case',
};

const SOCKETS_CPU = ['AM5', 'LGA1700', 'AM5', 'LGA1700', 'AM5', 'LGA1700'];
const TDP_CPU = [120, 125, 65, 105, 170, 125, 120, 65, 105, 125, 170, 65, 105, 65, 105, 125, 105, 125, 65, 105, 65, 58];
const MB_SOCKETS = ['AM5', 'LGA1700', 'AM5', 'LGA1700', 'AM5', 'LGA1700'];
const MB_RAM = ['DDR5', 'DDR5', 'DDR5', 'DDR5', 'DDR4', 'DDR5'];
const MB_FORM = ['ATX', 'mATX', 'ATX', 'mATX', 'ATX', 'mATX', 'ITX'];
const RAM_TYPE = ['DDR5', 'DDR5', 'DDR5', 'DDR4', 'DDR5', 'DDR5'];
const TDP_GPU = [200, 160, 320, 263, 450, 115, 245, 200, 355, 320, 185, 140, 350, 335, 320, 290, 290, 200, 170, 220, 130, 200, 285, 225, 350, 315, 300];
const PSU_WATTS = [750, 850, 1000, 750, 850, 750, 850, 1000, 1000, 850, 1000, 850, 750, 750, 1000, 650, 1000, 850];
const COOL_TDP = [250, 150, 230, 250, 250, 250, 200, 95, 250, 200, 250, 280, 150, 250, 200, 250, 200, 250];
const CAB_FORM = ['ATX', 'ATX', 'ATX', 'ATX', 'ATX', 'ATX', 'ATX', 'mATX', 'ATX', 'ATX', 'ATX', 'ATX', 'ATX', 'ATX', 'ATX', 'ATX', 'ATX', 'mATX'];

function buildMeta() {
  const meta = {};
  for (let i = 1; i <= 22; i++) {
    const id = `CPU${String(i).padStart(2, '0')}`;
    meta[id] = { tdp: TDP_CPU[i - 1] ?? 105, socket: SOCKETS_CPU[(i - 1) % SOCKETS_CPU.length] };
  }
  for (let i = 1; i <= 27; i++) {
    const id = `MB${String(i).padStart(2, '0')}`;
    meta[id] = {
      socket: MB_SOCKETS[(i - 1) % MB_SOCKETS.length],
      ramType: MB_RAM[(i - 1) % MB_RAM.length],
      formFactor: MB_FORM[(i - 1) % MB_FORM.length],
    };
  }
  for (let i = 1; i <= 22; i++) {
    const id = `RAM${String(i).padStart(2, '0')}`;
    meta[id] = { ramType: RAM_TYPE[(i - 1) % RAM_TYPE.length] };
  }
  for (let i = 1; i <= 27; i++) {
    const id = `GPU${String(i).padStart(2, '0')}`;
    meta[id] = { tdp: TDP_GPU[i - 1] ?? 200 };
  }
  for (let i = 1; i <= 22; i++) {
    meta[`SSD${String(i).padStart(2, '0')}`] = {};
  }
  for (let i = 1; i <= 18; i++) {
    const id = `PSU${String(i).padStart(2, '0')}`;
    meta[id] = { wattage: PSU_WATTS[i - 1] ?? 750 };
  }
  for (let i = 1; i <= 18; i++) {
    const id = `COOL${String(i).padStart(2, '0')}`;
    meta[id] = { tdp: COOL_TDP[i - 1] ?? 200 };
  }
  for (let i = 1; i <= 18; i++) {
    const id = `CAB${String(i).padStart(2, '0')}`;
    const form = CAB_FORM[i - 1] ?? 'ATX';
    meta[id] = {
      formFactor: form,
      supports: form === 'ATX' ? ['ATX', 'mATX', 'ITX'] : form === 'mATX' ? ['mATX', 'ITX'] : ['ITX'],
    };
  }
  return meta;
}

export const pcBuilderMeta = buildMeta();

// Base system overhead (MB, RAM, storage, fans) in watts
export const BUILDER_OVERHEAD_WATTS = 80;

// Headroom % on top of total TDP for PSU recommendation
export const PSU_HEADROOM_PERCENT = 20;
