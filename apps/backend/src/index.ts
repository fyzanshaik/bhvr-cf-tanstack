import { createDb } from '@repo/db';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import apiRoutes from './routes/api';
import type { Env, HonoVariables } from './types';

/**
 * Main Hono application
 */
const app = new Hono<{ Bindings: Env; Variables: HonoVariables }>();

// Middleware
app.use('*', logger());
app.use('*', prettyJSON());

// CORS - Allow requests from frontend
app.use(
	'*',
	cors({
		origin: (origin) => {
			// Allow localhost for development
			if (origin.includes('localhost')) return origin;
			// Allow Cloudflare Pages domains
			if (origin.endsWith('.pages.dev')) return origin;
			// Allow custom domains (add yours here)
			// if (origin === 'https://yourdomain.com') return origin;
			return origin; // Allow all origins (remove in production if needed)
		},
		credentials: true,
	})
);

// Database middleware - attach db instance to context
// D1 Version (current):
app.use('*', async (c, next) => {
	const db = createDb(c.env.DB);
	c.set('db', db);
	await next();
});

// PostgreSQL Version (uncomment when using PostgreSQL):
// app.use('*', async (c, next) => {
// 	const db = createDb(c.env.DATABASE_URL);
// 	c.set('db', db);
// 	await next();
// });

// Health check endpoint
app.get('/', (c) => {
	return c.json({
		message: 'Cloudflare Fullstack API',
		status: 'healthy',
		timestamp: new Date().toISOString(),
	});
});

// API routes
app.route('/api', apiRoutes);

// 404 handler
app.notFound((c) => {
	return c.json({ error: 'Not Found', path: c.req.path }, 404);
});

// Error handler
app.onError((err, c) => {
	console.error(`Error: ${err.message}`);
	return c.json(
		{
			error: 'Internal Server Error',
			message: err.message,
		},
		500
	);
});

export default app;
export type AppType = typeof app;
