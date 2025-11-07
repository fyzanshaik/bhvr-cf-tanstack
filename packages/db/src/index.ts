// ==========================================
// DATABASE CONNECTION - Cloudflare D1 (SQLite)
// ==========================================
// To use PostgreSQL, see: docs/POSTGRESQL.md

import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

// PostgreSQL imports (uncomment to use PostgreSQL):
// import { drizzle } from 'drizzle-orm/postgres-js';
// import postgres from 'postgres';
// OR for Neon (recommended for Workers):
// import { neon } from '@neondatabase/serverless';
// import { drizzle } from 'drizzle-orm/neon-http';

export * from './schema';
export { schema };

/**
 * D1 Version (current)
 * Creates a Drizzle ORM instance for D1 database
 * @param db - D1Database instance from Cloudflare Workers
 */
export function createDb(db: any) {
	return drizzle(db as any, { schema });
}

/**
 * PostgreSQL Version (commented out)
 * Uncomment one of these based on your PostgreSQL provider:
 */

// Option 1: Standard PostgreSQL (postgres-js)
// export function createDb(connectionString: string) {
// 	const client = postgres(connectionString);
// 	return drizzle(client, { schema });
// }

// Option 2: Neon (recommended for Cloudflare Workers)
// export function createDb(connectionString: string) {
// 	const sql = neon(connectionString);
// 	return drizzle(sql, { schema });
// }

export type DbInstance = ReturnType<typeof createDb>;
