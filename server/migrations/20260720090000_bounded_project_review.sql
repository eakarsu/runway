CREATE TABLE IF NOT EXISTS "Users" (
  "id" SERIAL PRIMARY KEY,
  "email" VARCHAR(255) NOT NULL UNIQUE,
  "password" VARCHAR(255) NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS "Projects" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "type" VARCHAR(255) NOT NULL DEFAULT 'video',
  "status" VARCHAR(255) NOT NULL DEFAULT 'draft',
  "thumbnail" VARCHAR(2048),
  "userId" INTEGER NOT NULL,
  "reviewStatus" VARCHAR(32) NOT NULL DEFAULT 'pending',
  "reviewedAt" TIMESTAMPTZ,
  "reviewedBy" INTEGER,
  "reviewNotes" TEXT,
  "version" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE "Projects" ADD COLUMN IF NOT EXISTS "reviewStatus" VARCHAR(32) NOT NULL DEFAULT 'pending';
ALTER TABLE "Projects" ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMPTZ;
ALTER TABLE "Projects" ADD COLUMN IF NOT EXISTS "reviewedBy" INTEGER;
ALTER TABLE "Projects" ADD COLUMN IF NOT EXISTS "reviewNotes" TEXT;
ALTER TABLE "Projects" ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "ProjectSnapshots" (
  "id" SERIAL PRIMARY KEY,
  "projectId" INTEGER NOT NULL,
  "userId" INTEGER NOT NULL,
  "versionNumber" INTEGER NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "status" VARCHAR(255),
  "reviewStatus" VARCHAR(32),
  "thumbnail" VARCHAR(2048),
  "note" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE "ProjectSnapshots" ADD COLUMN IF NOT EXISTS "reviewStatus" VARCHAR(32);

CREATE TABLE IF NOT EXISTS "Comments" (
  "id" SERIAL PRIMARY KEY,
  "projectId" INTEGER NOT NULL,
  "userId" INTEGER NOT NULL,
  "body" TEXT NOT NULL,
  "anchor" VARCHAR(255),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Exports" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "format" VARCHAR(32) NOT NULL DEFAULT 'mp4',
  "resolution" VARCHAR(32) NOT NULL DEFAULT '1080p',
  "status" VARCHAR(32) NOT NULL DEFAULT 'pending',
  "fileUrl" VARCHAR(2048),
  "projectId" INTEGER,
  "projectVersion" INTEGER,
  "userId" INTEGER NOT NULL,
  "idempotencyKey" VARCHAR(255),
  "provider" VARCHAR(255),
  "providerReference" VARCHAR(255),
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "lastError" TEXT,
  "nextRetryAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE "Exports" ADD COLUMN IF NOT EXISTS "idempotencyKey" VARCHAR(255);
ALTER TABLE "Exports" ADD COLUMN IF NOT EXISTS "projectVersion" INTEGER;
ALTER TABLE "Exports" ADD COLUMN IF NOT EXISTS "provider" VARCHAR(255);
ALTER TABLE "Exports" ADD COLUMN IF NOT EXISTS "providerReference" VARCHAR(255);
ALTER TABLE "Exports" ADD COLUMN IF NOT EXISTS "attempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Exports" ADD COLUMN IF NOT EXISTS "lastError" TEXT;
ALTER TABLE "Exports" ADD COLUMN IF NOT EXISTS "nextRetryAt" TIMESTAMPTZ;
UPDATE "Exports" SET "idempotencyKey" = 'legacy-export-' || "id" WHERE "idempotencyKey" IS NULL;
UPDATE "Exports" SET "projectVersion" = 0 WHERE "projectVersion" IS NULL;
UPDATE "Exports"
SET
  "status" = 'failed',
  "lastError" = COALESCE("lastError", 'Legacy export requires manual provenance reconciliation')
WHERE "status" NOT IN ('pending', 'submitting', 'failed', 'submitted');
ALTER TABLE "Exports" ALTER COLUMN "idempotencyKey" SET NOT NULL;
ALTER TABLE "Exports" ALTER COLUMN "projectVersion" SET NOT NULL;

CREATE TABLE IF NOT EXISTS "AuditEvents" (
  "id" BIGSERIAL PRIMARY KEY,
  "projectId" INTEGER NOT NULL,
  "actorId" INTEGER NOT NULL,
  "sequence" INTEGER NOT NULL,
  "action" VARCHAR(128) NOT NULL,
  "payload" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "previousHash" VARCHAR(64) NOT NULL,
  "hash" VARCHAR(64) NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_review_status_check') THEN
    ALTER TABLE "Projects" ADD CONSTRAINT projects_review_status_check CHECK ("reviewStatus" IN ('pending', 'approved', 'rejected'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_version_check') THEN
    ALTER TABLE "Projects" ADD CONSTRAINT projects_version_check CHECK ("version" >= 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'exports_status_check') THEN
    ALTER TABLE "Exports" ADD CONSTRAINT exports_status_check CHECK ("status" IN ('pending', 'submitting', 'failed', 'submitted'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'exports_attempts_check') THEN
    ALTER TABLE "Exports" ADD CONSTRAINT exports_attempts_check CHECK ("attempts" >= 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_user_fk') THEN
    ALTER TABLE "Projects" ADD CONSTRAINT projects_user_fk FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_reviewer_fk') THEN
    ALTER TABLE "Projects" ADD CONSTRAINT projects_reviewer_fk FOREIGN KEY ("reviewedBy") REFERENCES "Users"("id") ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'snapshots_project_fk') THEN
    ALTER TABLE "ProjectSnapshots" ADD CONSTRAINT snapshots_project_fk FOREIGN KEY ("projectId") REFERENCES "Projects"("id") ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'snapshots_user_fk') THEN
    ALTER TABLE "ProjectSnapshots" ADD CONSTRAINT snapshots_user_fk FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'comments_project_fk') THEN
    ALTER TABLE "Comments" ADD CONSTRAINT comments_project_fk FOREIGN KEY ("projectId") REFERENCES "Projects"("id") ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'comments_user_fk') THEN
    ALTER TABLE "Comments" ADD CONSTRAINT comments_user_fk FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'exports_project_fk') THEN
    ALTER TABLE "Exports" ADD CONSTRAINT exports_project_fk FOREIGN KEY ("projectId") REFERENCES "Projects"("id") ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'exports_user_fk') THEN
    ALTER TABLE "Exports" ADD CONSTRAINT exports_user_fk FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'audit_project_fk') THEN
    ALTER TABLE "AuditEvents" ADD CONSTRAINT audit_project_fk FOREIGN KEY ("projectId") REFERENCES "Projects"("id") ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'audit_actor_fk') THEN
    ALTER TABLE "AuditEvents" ADD CONSTRAINT audit_actor_fk FOREIGN KEY ("actorId") REFERENCES "Users"("id") ON DELETE RESTRICT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS projects_owner_created_idx ON "Projects" ("userId", "createdAt" DESC);
CREATE UNIQUE INDEX IF NOT EXISTS project_snapshots_version_key ON "ProjectSnapshots" ("projectId", "versionNumber");
CREATE INDEX IF NOT EXISTS project_snapshots_owner_idx ON "ProjectSnapshots" ("projectId", "userId", "versionNumber" DESC);
CREATE INDEX IF NOT EXISTS comments_project_owner_idx ON "Comments" ("projectId", "userId", "createdAt" DESC);
CREATE UNIQUE INDEX IF NOT EXISTS exports_owner_idempotency_key ON "Exports" ("userId", "idempotencyKey");
CREATE INDEX IF NOT EXISTS exports_owner_created_idx ON "Exports" ("userId", "createdAt" DESC);
CREATE UNIQUE INDEX IF NOT EXISTS audit_project_sequence_key ON "AuditEvents" ("projectId", "sequence");

CREATE OR REPLACE FUNCTION reject_runway_evidence_mutation() RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Runway audit and version evidence is append-only';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS audit_events_append_only ON "AuditEvents";
CREATE TRIGGER audit_events_append_only BEFORE UPDATE OR DELETE ON "AuditEvents"
FOR EACH ROW EXECUTE FUNCTION reject_runway_evidence_mutation();

DROP TRIGGER IF EXISTS project_snapshots_append_only ON "ProjectSnapshots";
CREATE TRIGGER project_snapshots_append_only BEFORE UPDATE OR DELETE ON "ProjectSnapshots"
FOR EACH ROW EXECUTE FUNCTION reject_runway_evidence_mutation();
