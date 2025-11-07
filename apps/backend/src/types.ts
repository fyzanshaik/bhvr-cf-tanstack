/// <reference types="@cloudflare/workers-types" />

/**
 * Cloudflare Workers environment bindings
 */
export interface Env {
	// D1 (SQLite) - current configuration
	DB: D1Database;
	ENVIRONMENT?: string;

	// PostgreSQL - uncomment when using PostgreSQL
	// DATABASE_URL: string;
	// ENVIRONMENT?: string;
}

/**
 * Context variables for Hono app
 */
export interface HonoVariables {
	db: ReturnType<typeof import('@repo/db')['createDb']>;
}
