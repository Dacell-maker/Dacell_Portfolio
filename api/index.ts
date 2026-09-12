/**
 * Vercel serverless entry point.
 *
 * Vercel invokes the DEFAULT export as the request handler, and an Express app
 * is exactly such a handler: (req, res) => void. Every /api/* request is routed
 * here by the rewrite in vercel.json.
 */
import { app } from '../server/app';

export default app;
export { app };

export const config = {
  runtime: 'nodejs20.x',
  maxDuration: 30,
};
