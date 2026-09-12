/**
 * Vercel serverless entry point.
 *
 * The Express app is pre-bundled into ./_app.cjs by `npm run build:api`
 * (esbuild) during `vercel build`, because Vercel's function packager does
 * not follow cross-folder TypeScript imports at runtime. This file stays
 * tiny: hand the bundled app to Vercel as the default export.
 */
import mod from './_app.cjs';

const app = mod.app ?? mod.default ?? mod;

export default app;

export const config = {
  maxDuration: 30,
};
