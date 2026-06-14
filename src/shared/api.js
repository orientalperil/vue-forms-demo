/**
 * API client.
 *
 * By default this re-exports the MOCK backend so the demo runs with no server.
 * The mock returns axios-shaped responses/errors, so swapping in real axios is
 * a one-line change with no edits to any Submitter.
 *
 * --- To use a real Django REST Framework backend ---
 * 1. Uncomment the axios block below and delete the mock line.
 * 2. Enable the /api proxy in vite.config.js (or set VITE_API_BASE_URL).
 *
 * import axios from 'axios'
 * export const api = axios.create({
 *   baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
 *   withCredentials: true,
 *   xsrfCookieName: 'csrftoken',
 *   xsrfHeaderName: 'X-CSRFToken',
 * })
 */
import { mockApi } from './mockBackend.js'

export const api = mockApi
