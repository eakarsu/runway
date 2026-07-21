const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const sequelize = require('../config/database');

const migrationsDirectory = path.join(__dirname, '..', 'migrations');

async function migrationFiles() {
  return (await fs.readdir(migrationsDirectory)).filter((name) => name.endsWith('.sql')).sort();
}

const checksum = (source) => crypto.createHash('sha256').update(source).digest('hex');

async function ensureLedger() {
  await sequelize.query(`CREATE TABLE IF NOT EXISTS "SchemaMigrations" (
    "name" TEXT PRIMARY KEY,
    "checksum" VARCHAR(64) NOT NULL,
    "appliedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
}

async function verifySchema() {
  const [rows] = await sequelize.query(`
    SELECT
      to_regclass('public."Users"') IS NOT NULL AS users,
      to_regclass('public."Projects"') IS NOT NULL AS projects,
      to_regclass('public."ProjectSnapshots"') IS NOT NULL AS snapshots,
      to_regclass('public."Comments"') IS NOT NULL AS comments,
      to_regclass('public."Exports"') IS NOT NULL AS exports,
      to_regclass('public."AuditEvents"') IS NOT NULL AS audits,
      EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Projects' AND column_name = 'reviewStatus') AS project_review,
      EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Exports' AND column_name = 'idempotencyKey') AS export_idempotency,
      EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_events_append_only' AND NOT tgisinternal) AS audit_trigger,
      EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'project_snapshots_append_only' AND NOT tgisinternal) AS snapshot_trigger
  `);
  const missing = Object.entries(rows[0]).filter(([, present]) => !present).map(([name]) => name);
  if (missing.length) throw new Error(`Schema verification failed: ${missing.join(', ')}`);
}

async function migrate({ checkOnly = false } = {}) {
  await sequelize.authenticate();
  await sequelize.query('SELECT pg_advisory_lock(2026072009)');
  try {
    const files = await migrationFiles();
    if (checkOnly) {
      const [[ledger]] = await sequelize.query(`SELECT to_regclass('public."SchemaMigrations"') IS NOT NULL AS present`);
      if (!ledger.present) throw new Error('Schema migration ledger is missing');
    } else {
      await ensureLedger();
    }
    const [appliedRows] = await sequelize.query('SELECT "name", "checksum" FROM "SchemaMigrations"');
    const applied = new Map(appliedRows.map((row) => [row.name, row.checksum]));
    for (const name of files) {
      const source = await fs.readFile(path.join(migrationsDirectory, name), 'utf8');
      const digest = checksum(source);
      if (applied.has(name)) {
        if (applied.get(name) !== digest) throw new Error(`Applied migration checksum changed: ${name}`);
        continue;
      }
      if (checkOnly) throw new Error(`Pending migration: ${name}`);
      await sequelize.transaction(async (transaction) => {
        await sequelize.query(source, { transaction });
        await sequelize.query('INSERT INTO "SchemaMigrations" ("name", "checksum") VALUES (:name, :checksum)', {
          replacements: { name, checksum: digest },
          transaction,
        });
      });
      console.log(`Applied ${name}`);
    }
    await verifySchema();
    console.log(`Schema verified; ${files.length} migration(s) current.`);
  } finally {
    await sequelize.query('SELECT pg_advisory_unlock(2026072009)').catch(() => undefined);
  }
}

if (require.main === module) {
  migrate({ checkOnly: process.argv.includes('--check') })
    .then(() => sequelize.close())
    .catch(async (error) => { console.error(error.message); await sequelize.close().catch(() => undefined); process.exitCode = 1; });
}

module.exports = { migrate, verifySchema };
