require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { validateRuntime } = require('./config/runtime');
const runtime = validateRuntime();
const sequelize = require('./config/database');
const { migrate } = require('./scripts/migrate');
const { createApp } = require('./app');

async function start() {
  await sequelize.authenticate();
  await migrate({ checkOnly: true });
  const app = createApp();
  const host = process.env.SERVER_HOST || '127.0.0.1';
  if (host !== '127.0.0.1' && host !== '0.0.0.0') throw new Error('SERVER_HOST must be 127.0.0.1 or 0.0.0.0');
  const server = app.listen(runtime.serverPort, host, () => console.log(`Runway API listening on http://${host}:${runtime.serverPort}`));
  return { app, server };
}

if (require.main === module) {
  start().catch(async (error) => {
    console.error(`Failed to start server: ${error.message}`);
    await sequelize.close().catch(() => undefined);
    process.exitCode = 1;
  });
}

module.exports = { start };
