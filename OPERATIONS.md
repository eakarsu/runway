# Runway bounded-workflow operations

The supported workflow is private project creation, immutable version snapshots, owner comments, explicit human review, and evidence-backed export submission. Generated AI/media routes are disabled unless `ENABLE_PROTOTYPE_ROUTES=true`; enabling them does not make them production-approved.

## Release

1. Install the locked server and client dependencies with `npm ci` in each directory.
2. Run both `npm run verify` commands and build the client.
3. Create and verify a protected backup with `scripts/backup-database.sh` and `scripts/verify-backup.sh`.
4. Run `scripts/release-migrate.sh` as a single explicit release job. A second run must report the same migration current and must not replay it.
5. Deploy the prepared files and run `start.sh`. Startup only verifies migrations; it never changes schema or seed data.
6. Check `/api/health`, `/api/ready`, and `/api/boundary`, then authenticate and exercise a project review without submitting to a provider.

## Recovery

At least quarterly, restore a verified custom-format backup into a newly created isolated database. Confirm `SchemaMigrations`, `Projects`, `ProjectSnapshots`, `Exports`, and `AuditEvents`, verify an audit hash chain through the API, then destroy only the explicitly named recovery database. Never restore over production.

## Rollback

Use the previous immutable application artifact when schema-compatible. Migrations are forward-only: preserve a fresh backup, stop writes, and use a reviewed forward repair migration rather than editing an applied migration or improvising destructive SQL.

The export provider requires an approved HTTPS endpoint, a non-placeholder token, retention/privacy terms, and an operator-owned retry process. A provider response is not accepted without a reference; missing or failed providers persist retry evidence and do not mark an export submitted.
