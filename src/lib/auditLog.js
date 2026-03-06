/**
 * SOC2-aligned audit logging for security-relevant events.
 * Use for: authentication, authorization failures, sensitive data access, config changes.
 * Logs are structured for SIEM/audit review (CC6.1, CC7.2).
 */

const LOG_LEVEL = process.env.AUDIT_LOG_LEVEL || 'info';

function sanitize(obj) {
  if (obj == null) return obj;
  if (typeof obj !== 'object') return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const lower = k.toLowerCase();
    if (lower.includes('password') || lower.includes('secret') || lower.includes('token')) continue;
    out[k] = typeof v === 'object' && v !== null && !Array.isArray(v) ? sanitize(v) : v;
  }
  return out;
}

/**
 * Emit a structured audit log entry. In production, send to your logging/SIEM backend.
 * @param {Object} params
 * @param {string} params.event - Event type (e.g. auth.login.success, auth.session.invalid)
 * @param {string} [params.userId] - User identifier (e.g. email), not sensitive tokens
 * @param {string} [params.resource] - Resource or endpoint
 * @param {string} [params.result] - success | failure
 * @param {string} [params.ip] - Client IP
 * @param {string} [params.userAgent] - User-Agent
 * @param {Object} [params.metadata] - Additional safe context (no secrets)
 */
function auditLog({ event, userId, resource, result, ip, userAgent, metadata = {} }) {
  const entry = {
    ts: new Date().toISOString(),
    event,
    userId: userId || null,
    resource: resource || null,
    result: result || null,
    ip: ip || null,
    userAgent: userAgent || null,
    ...sanitize(metadata),
  };
  if (process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify({ level: LOG_LEVEL, audit: entry }));
  }
  return entry;
}

module.exports = { auditLog };
