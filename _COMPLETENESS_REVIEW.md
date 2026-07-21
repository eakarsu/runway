# Completeness Review: runway

**Review date:** 2026-07-18

## Assessment basis

Static inspection of project-owned source and configuration only; no dependency installation, build, database migration, external-service call, or runtime launch was performed. The scan considered 159 project files (140 source files), 2 manifest(s), 0 test-like file(s), and 0 CI workflow(s), excluding dependency/generated directories.

## Classification

**Prototype-demo**

This is a prototype/demo for legal/document workflow. Generated gap/demo patterns are present: it contains 140 source files and visible routes/pages in `client/`, `server/`, but those surfaces are not evidence of durable domain execution, verified integrations, or operational completion.

## Why it is not complete

- Generated gap/visualization routes describe missing capabilities or simulate recommendations; they do not implement the underlying domain operation.
- Generic LLM calls are used as product behavior without enough typed tools, grounded evidence, deterministic rules, or output evaluation.
- Mock, demo, sample, fixture, or placeholder behavior remains in executable/product paths.
- No recognizable project-owned automated tests were found for the main workflow.
- No checked-in CI workflow proves builds, tests, migrations, and security checks on every change.

## Needed features

1. Add matter-scoped permissions, document provenance, version history, privileged-access controls, and immutable audit events.
2. Integrate OCR, e-signature, filing/storage, retention/legal-hold, and authoritative template sources.
3. Require human legal review and jurisdiction/effective-date validation for generated clauses, forms, or recommendations.
4. Test redaction, conflicting versions, signer failure, access revocation, export, and retention workflows end to end.
5. Add risk-based unit, integration, and end-to-end tests in CI, including migration and failure-path coverage.

## Risks or launch blockers

- Credential/configuration exposure: environment files are present in the repository tree and must be checked against Git history and rotated if real.
- Automation contains destructive process, filesystem, or database operations; do not run it on a shared machine without review.
- Startup appears coupled to seed/migration behavior, risking data mutation or non-repeatable launches.
- AI-provider availability, cost, privacy, prompt injection, and unvalidated output are launch risks until bounded and evaluated.

## Evidence inspected

- `client/README.md`
- `client/src/App.jsx:47`
- `client/src/components/GapFeaturePage.jsx:54`
- `server/index.js`
- `client/package.json`
- `start.sh`

## Recommended next action

Stop adding generated pages; prove one legal/document workflow workflow against real services and persistent state, with tests and measurable acceptance criteria.

## Implementation progress (2026-07-20)

### Corrected scope and supported workflow

The original review classified this repository as a legal/document product, but its source is an AI-media prototype. Legal matter privilege, OCR, e-signature, court filing, legal hold, jurisdiction validation, and authoritative legal templates do not exist here and were not fabricated. `SECURITY.md` records that boundary explicitly.

One actual workflow is now implemented and tested: an authenticated owner creates a private media project, records immutable snapshots and comments, approves or rejects an exact version, creates an idempotent export request, and submits that approved version to an explicitly configured HTTPS export provider. Generated AI/media, spreadsheet, report, and publishing routes are disabled by default and return `PROTOTYPE_DISABLED` unless an operator deliberately opts into the ungoverned prototype surface.

### Review requirements addressed

1. **Permissions, provenance, versions, and audit:** every supported project, comment, snapshot, export, and audit read/write is owner-scoped. Project writes use optimistic versions and database row locks. Updates and restores invalidate review. Snapshots and SHA-256-linked audit events are append-only through database triggers; projects are archived and exports retained rather than deleted.
2. **External operations and retention:** unrelated legal integrations are out of scope. The actual export boundary fails closed without an approved HTTPS URL and non-placeholder token, sends an idempotency key and exact project-version evidence, requires a durable provider reference, bounds retry intervals, and persists failures. Forward-only SQL migrations, checksum/replay verification, protected custom-format backups, checksum verification, restore instructions, and disposable seed gates are included. Legacy export states are quarantined as failed for manual provenance reconciliation during migration.
3. **Human review and generated output:** export creation requires an explicit human decision with notes for the current project version; any edit or restore makes that approval stale. The app does not claim legal review. Generated provider routes remain disabled by default, and `SECURITY.md` treats their output as unapproved prototype behavior.
4. **Failure and access tests:** the end-to-end workflow covers cross-owner project/comment/snapshot/export denial, concurrent conflicting versions, immutable evidence, approval invalidation after restore, idempotent export replay, missing-provider failure and retry evidence, stale export rejection, audit-chain validation, and immediate token revocation when a user is deactivated. Client import tests cover quoted/missing CSV values, `.xlsx` formula cached values and provenance, and rejection of legacy/ambiguous formats.
5. **CI and operations:** CI installs locked dependencies, replays/checks migrations, runs server syntax/unit/integration tests, client lint/tests/build, low-threshold dependency audits, a prepared-runtime/occupied-port smoke test, backup/isolated restore verification, and a full-history Gitleaks scan. Routine startup only checks already-applied migrations and prepared artifacts; it never installs, builds, migrates, seeds, or stops unrelated processes.

The runtime launcher now also honors an explicitly assigned source root, requires distinct caller-assigned API and UI ports, binds locally, and maps the validator's explicit CORS origin only outside production. Initial operator provisioning is an acknowledgement-gated, idempotent command that refuses to overwrite an existing account with different credentials. The destructive fixture loader is exposed only as `demo-data:load`, not as the routine seed or startup path.

### Verification evidence

- Server syntax: **59 files verified**; server unit tests: **11/11 passed**.
- Isolated PostgreSQL 14 integration test: **1/1 passed**, including access, concurrency, review, export, revocation, and append-only failure paths.
- Client lint: **passed with zero warnings**; client tests: **3/3 passed**; Vite production build: **passed** (2,394 modules; a non-blocking large-chunk performance warning remains).
- Server and client `npm audit --audit-level=low`: **0 vulnerabilities** each.
- Gitleaks full-history scan: **0 leaks across five commits**.
- Fresh migration, replay, and check-only validation: **passed**. A simulated legacy database migrated `completed`/`processing` exports to quarantined `failed` records while preserving pending records and backfilling evidence keys.
- Gated disposable seed: **passed** with 16/16 legacy export fixtures quarantined and the migration/audit triggers installed.
- Prepared runtime: `/api/ready` returned ready, project creation returned **201**, disabled prototype access returned **501**, and a second start refused occupied ports while the first runtime remained alive.
- Independent acceptance run: `start.sh` launched the prepared API and UI on assigned loopback ports, the provisioned operator logged in, `/api/auth/me` revalidated the persisted session, and an authenticated project API returned successfully (**API_VERIFIED / startup_login_session_api**).
- Fresh PostgreSQL verification after the launcher/provisioner changes: migration + replay check passed, server syntax verified **60 files**, server unit tests passed **11/11**, the governed integration workflow passed **1/1**, client lint passed, client tests passed **3/3**, and the Vite production build passed.
- Backup/restore: checksum and custom-format verification passed; an isolated restore contained **7 public workflow tables, 1 migration record, and 9 audit events**.

### Remaining external launch gates

The bounded workflow is implemented, but a production launch still requires accountable owner acceptance, a managed PostgreSQL/backup-retention environment, controlled execution of the operator-provisioning command, a reviewed browser session/CSRF design if exposed publicly, and an approved export-provider contract, URL, token, privacy/retention terms, and recovery process. Enabling any generated prototype route additionally requires provider-specific privacy, provenance, evaluation, cost, and failure controls. Building a legal/document product would be a separate product scope, not a remaining code checkbox for this repository.
