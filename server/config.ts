import dotenv from 'dotenv';

/** Runtime configuration — every secret comes from environment variables. */

// Load .env / .env.local for local development. On Vercel the variables are
// injected by the platform, so this is a no-op there.
dotenv.config({ path: ['.env.local', '.env'], quiet: true });

function required(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

const mongodbUri = required('MONGODB_URI');

export const config = {
  mongodbUri,
  dbName: required('MONGODB_DB') ?? 'portfolio',
  jwtSecret: required('JWT_SECRET'),
  setupToken: required('SETUP_TOKEN'),
  blobToken: required('BLOB_READ_WRITE_TOKEN'),
  port: Number(required('API_PORT') ?? 8787),
  isProduction: process.env.NODE_ENV === 'production',
  /**
   * Development convenience: keeps the admin dashboard fully usable before
   * MongoDB Atlas is connected. Automatically disabled once MONGODB_URI is set.
   */
  devMemoryDb: !mongodbUri && required('ENABLE_DEV_MEMORY_DB') === 'true' && process.env.NODE_ENV !== 'production',
};

export const hasDatabase = Boolean(config.mongodbUri) || config.devMemoryDb;
export const isMemoryDb = config.devMemoryDb;
export const hasBlob = Boolean(config.blobToken);
export const hasAuthSecret = Boolean(config.jwtSecret);
