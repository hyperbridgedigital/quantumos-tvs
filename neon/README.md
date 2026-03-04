# Neon Database — QuantumOS Charminar Mehfil

This project uses [Neon](https://neon.tech) serverless PostgreSQL.

## Setup

1. Create a Neon project at [console.neon.tech](https://console.neon.tech)
2. Copy the **pooled** connection string (host ends with `-pooler`)
3. Add to `.env`:
   ```
   DATABASE_URL=postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
   ```

## Run Migration

```bash
npm run db:migrate
```

Or with psql directly:

```bash
psql $DATABASE_URL -f neon/migration.sql
```

## Usage in Code

```js
import { getDb } from '@/lib/db';

// In API route or Server Component
const sql = getDb();
const stores = await sql`SELECT * FROM stores`;
```
