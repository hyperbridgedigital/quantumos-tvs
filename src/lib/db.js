/**
 * Neon Serverless PostgreSQL — QuantumOS Charminar Mehfil
 * Use in Server Components, API routes, Server Actions
 */

import { neon } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL;

export function getDb() {
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set. Add it to .env');
  }
  return neon(connectionString);
}

/** Tagged template for queries: sql`SELECT * FROM stores` */
export function sql(strings, ...values) {
  const db = getDb();
  return db(strings, ...values);
}
