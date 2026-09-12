import { app } from './app';
import { config } from './config';
import { isDatabaseReady } from './db';

async function start() {
  const database = await isDatabaseReady();

  app.listen(config.port, '0.0.0.0', () => {
    console.log(`\n  API listening on http://localhost:${config.port}`);
    console.log(`  MongoDB:  ${database ? 'connected ✔' : 'not configured — public /api/projects serves bundled seed data'}`);
    console.log(`  Blob:     ${config.blobToken ? 'configured ✔' : 'not configured — uploads are stored inline'}`);
    console.log(`  Auth:     ${config.jwtSecret ? 'JWT_SECRET set ✔' : 'JWT_SECRET missing — /admin login disabled'}\n`);
  });
}

void start();
