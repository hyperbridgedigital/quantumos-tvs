#!/usr/bin/env node
/**
 * Run Neon migration
 * Usage: node scripts/migrate-neon.mjs
 */
import postgres from 'postgres';
import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env');
if (existsSync(envPath)) {
  const env = readFileSync(envPath, 'utf8');
  for (const line of env.split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  }
}
const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL not set. Load .env first.');
  process.exit(1);
}

const sql = postgres(url, { max: 1 });
const migrationPath = join(__dirname, '..', 'neon', 'migration.sql');
const content = readFileSync(migrationPath, 'utf8');

try {
  await sql.unsafe(content);
  console.log('✓ Migration complete.');
} catch (e) {
  console.error('Migration failed:', e.message);
  process.exit(1);
} finally {
  await sql.end();
}
