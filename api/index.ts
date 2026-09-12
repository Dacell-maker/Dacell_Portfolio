/**
 * Vercel serverless entry point.
 * Every /api/* request is handled by the same Express app used in development.
 */
export { app } from '../server/app.ts';
export const config = {
  maxDuration: 30,
};
