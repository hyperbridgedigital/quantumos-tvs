/**
 * In-memory Kynetra templates store for API.
 * Admin GET/PUT /api/kynetra/templates; POST /api/kynetra uses getTemplates().
 */
import { defaultKynetraTemplates } from '@/data/kynetraTemplates';

let templates = [...defaultKynetraTemplates];

export function getKynetraTemplates() {
  return templates;
}

export function setKynetraTemplates(next) {
  if (Array.isArray(next) && next.length > 0) {
    templates = next;
    return templates;
  }
  return templates;
}

export function resetKynetraTemplates() {
  templates = [...defaultKynetraTemplates];
  return templates;
}
