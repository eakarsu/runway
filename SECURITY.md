# Security and product boundary

Runway is an AI-media prototype, not a legal/document-workflow product. Legal matter privilege, OCR, e-signature, court filing, legal hold, jurisdiction validation, and authoritative legal templates are not present and must not be represented as implemented.

The governed workflow is narrower: an authenticated owner creates a private media project, records immutable snapshots/comments, explicitly approves an exact project version, requests an idempotent export, and submits it to an approved HTTPS provider. Ownership is checked for projects, comments, snapshots, audit evidence, and exports. Editing or restoring invalidates approval. Missing/provider failures persist retry evidence and never mark an export submitted.

- Public registration and all generated prototype routes are disabled by default.
- JWT verification pins HS256, issuer, audience, one-hour lifetime, and an active database user. Login attempts are bounded and passwords require 12-128 characters with mixed classes.
- Routine startup never installs, builds, changes schema, seeds data, kills unrelated processes, or silently takes a port. Migrations and disposable fixture seeding are separate, explicit operations.
- Audit events and project snapshots are append-only at the database layer and the audit chain is SHA-256 linked.
- The client uses a restrictive content-security policy. Bearer tokens remain a bounded prototype identity mechanism; a public deployment requires a reviewed browser-session/CSRF architecture.
- AI routes send submitted content to OpenRouter only when prototype routes and credentials are explicitly enabled. Do not submit confidential or regulated content without approved provider privacy, retention, and data-location terms.
- Export submission requires an approved provider contract, HTTPS endpoint, non-placeholder token, idempotency support, and durable provider reference.

Rotate any real credential that may previously have occupied a tracked environment file; deleting a current file does not remove Git history. Report suspected vulnerabilities privately to the accountable repository owner and never include credentials or personal data in issues or fixtures.
