/**
 * Feature Flag System — Controls module loading, AI features, security hardening
 */

const DEFAULT_FLAGS = {
  ai_analytics: true,
  ai_anomaly_detection: true,
  ai_fraud_detection: true,
  ai_recommendations: true,
  ai_chatbot: true,
  ai_admin_intelligence: true,
  whatsapp_viral: true,
  franchise_module: true,
  pos_module: true,
  delivery_60min: true,
  multi_store: true,
  advanced_crm: true,
  data_lifecycle: true,
  ultra_security: false,
  graphql_api: false,
  multi_tenant: false,
};

let flags = { ...DEFAULT_FLAGS };

export function isEnabled(key) { return flags[key] === true; }
export function getFlags() { return { ...flags }; }
export function setFlag(key, value) { flags = { ...flags, [key]: value }; }
export function setFlags(updates) { flags = { ...flags, ...updates }; }
export function resetFlags() { flags = { ...DEFAULT_FLAGS }; }

// Module registry — only loads if flag is enabled
export function getEnabledModules(allModules) {
  const moduleFlags = {
    whatsapp: 'whatsapp_viral',
    franchise: 'franchise_module',
    pos: 'pos_module',
    delivery: 'delivery_60min',
  };

  return allModules.filter(m => {
    const flag = moduleFlags[m.key];
    return !flag || isEnabled(flag);
  });
}
