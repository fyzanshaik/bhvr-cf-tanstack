import type { AppType } from '@repo/backend';
import { hc } from 'hono/client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

// Create typed Hono client for the backend API
export const apiClient = hc<AppType>(API_URL);
