# Audit Note - runway

Source: `_AUDIT/reports/batch_11.md` (lines 701-751).

## Original Audit Recommendations

### Missing AI Counterparts
- `/auto-subtitle-generator` for accessibility/SEO.
- `/music-recommendation` for soundtrack selection.
- `/scene-transition-suggester` for pacing improvements.
- `/performance-predictor` (engagement forecast).

### Missing Non-AI Features
- Real-time collaboration.
- Revision history / version control.
- Comment/annotation system.
- Export to YouTube/TikTok/Instagram.
- Team/permission management.
- Usage analytics.

### Custom Feature Suggestions
1. Multi-Scene Video Assembly Agent.
2. Performance Prediction & A/B Testing.
3. Brand Consistency Checker.
4. Real-Time Collaboration.
5. Platform-Specific Export Optimizer.
6. Subscription & Credit Management.

## Implementations Applied

Added 3 AI endpoints to `server/routes/ai.js` matching the existing OpenRouter+`parseSections` pattern and `authenticate` middleware:
- `POST /api/ai/auto-subtitle-generator`
- `POST /api/ai/music-recommendation`
- `POST /api/ai/scene-transition-suggester`

Each returns `{ success, type, result }` and includes structured Markdown sections like the existing endpoints. No new dependencies.

## Backlog (Prioritized)

### High
- `/performance-predictor` (needs analytics signals + decision on training source).
- Usage analytics (credits/tokens per project).
- Platform-specific export optimizer.

### Medium
- Revision history / version control.
- Real-time collaboration.
- Comment/annotation system.

### Low / Product Decisions
- Subscription & credit management.
- Brand consistency checker (multi-modal).
- YouTube/TikTok/Instagram export adapters.

## Apply pass 3 (frontend)

Verified the Vite/React/Tailwind frontend already exposes pages for every
AI endpoint, including all three added in pass 2:

- `client/src/pages/ai/AutoSubtitlePage.jsx` → `/api/ai/auto-subtitle-generator` (pass 2)
- `client/src/pages/ai/MusicRecommendationPage.jsx` → `/api/ai/music-recommendation` (pass 2)
- `client/src/pages/ai/SceneTransitionPage.jsx` → `/api/ai/scene-transition-suggester` (pass 2)
- Plus 12 other AI pages: `TextToVideoPage`, `ImageToVideoPage`, `StyleTransferPage`, `UpscalerPage`, `StoryboardGeneratorPage`, `MotionTrackerPage`, `SceneAnalyzerPage`, `ScriptWriterPage`, `VoiceGeneratorPage`, `TextToImagePage`, `BackgroundRemovalPage`, `ColorGraderPage`.

Sidebar (`components/layout/Sidebar.jsx`) and `App.jsx` registrations
include all new pages. Auth via shared `api` axios instance that injects
the token from `localStorage`.

Action: LEFT-AS-IS (FE already wired).

## Apply pass 4 (mechanical backlog)

Closed two MECHANICAL items from the high-priority backlog.

### New endpoints (in `server/routes/ai.js`)

- `POST /api/ai/performance-predictor` — engagement forecast for a
  video concept across YouTube / TikTok / Instagram. Inputs: `title`,
  `description`, `platforms`, `audience`, `durationSeconds`,
  `hashtags`. Returns the project's standard
  `{ success, type, result }` envelope, where `result.sections`
  follows the existing markdown-section pattern (Per-Platform
  Forecast / Engagement Drivers / Likely Risks / A/B Test Suggestions
  / Optimization Recommendations / Confidence).
- `POST /api/ai/platform-export-optimizer` — per-platform export
  settings, recommended cuts, aspect ratios, captioning notes,
  thumbnails, and posting tips. Inputs: `sourceFormat`,
  `durationSeconds`, `targets` (array), `contentSummary`.

Both new endpoints add an explicit 503 check on
`OPENROUTER_API_KEY` (the existing endpoints in this file do not — we
matched the structural pattern but tightened auth-readiness behaviour
on the new routes only).

### New frontend pages

- `client/src/pages/ai/PerformancePredictorPage.jsx` — full form with
  platforms, audience, duration, hashtags, structured response render
  via the existing `AIResponseDisplay` component.
- `client/src/pages/ai/PlatformExportOptimizerPage.jsx` —
  multi-select target buttons (YouTube / Shorts / TikTok / Reels /
  Feed / X / LinkedIn / Facebook), source format + duration, content
  summary.

Wiring:
- `App.jsx` — `/ai/performance-predictor` and
  `/ai/platform-export-optimizer` routes registered under the
  existing `AppLayout`.
- `components/layout/Sidebar.jsx` — added both items to `aiNav` with
  `TrendingUp` and `Share2` icons.

### Smoke test

PASS. Started `node server/index.js` on port 3001; `POST
/api/ai/performance-predictor` without a token returned 401 (route
mounted, `authenticate` middleware working). Cleaned up.

### Files touched

- `server/routes/ai.js`
- `client/src/App.jsx`
- `client/src/components/layout/Sidebar.jsx`
- `client/src/pages/ai/PerformancePredictorPage.jsx` (new)
- `client/src/pages/ai/PlatformExportOptimizerPage.jsx` (new)

### Remaining backlog

(see pass 5 below)

## Apply pass 5 (all backlog)

Closed five backlog items. New routes are mounted alongside existing routes;
new Sequelize models are added to `models/index.js` and picked up by the
existing `sequelize.sync({ alter: true })` call at startup.

### New endpoints

- `GET /api/ai/usage-analytics` — credit cost per generation type
  (`videos`, `images`, `voiceovers`, `storyboards`). PRODUCT-DECISION:
  illustrative cost map (`video=10, image=2, voiceover=5, storyboard=3`)
  baked into the route until a Plan model lands.
- `POST /api/ai/brand-consistency` — AI brand-rules check. 503 on missing
  `OPENROUTER_API_KEY`.
- `GET /api/comments/project/:projectId`, `POST /api/comments`,
  `DELETE /api/comments/:id` — annotation system. PRODUCT-DECISION:
  top-level only (no threading), only the author can delete.
- `GET/POST /api/projects/:projectId/snapshots`,
  `POST /api/projects/:projectId/snapshots/:snapshotId/restore` —
  revision history. PRODUCT-DECISION: snapshots store
  name/description/status/thumbnail; restore updates the live project but
  does not delete prior snapshots.
- `GET /api/export-adapters/status`, `POST /api/export-adapters/:platform`
  — YouTube / TikTok / Instagram. NEEDS-CREDS gated.

### New models

- `Comment(id, projectId, userId, body, anchor)`
- `ProjectSnapshot(id, projectId, userId, versionNumber, name, description, status, thumbnail, note)`

### New frontend pages

- `client/src/pages/ai/UsageAnalyticsPage.jsx`
- `client/src/pages/ai/BrandConsistencyPage.jsx`

`App.jsx` and `components/layout/Sidebar.jsx` updated.

### Smoke test

**PASS.** Started `node server/index.js` on port 3001. Logged in as
`admin@runway.com / admin123`. Authenticated calls:

- `GET /api/ai/usage-analytics` → 200
  `{"counts":{"videos":16,"images":16,"voiceovers":16,"storyboards":16},...,"totalCredits":320}`
- `GET /api/export-adapters/status` → 200 with all 3 platforms
  `configured: false` and per-platform `missing` arrays
- `POST /api/export-adapters/youtube` → 503 with full `missing` array
- `POST /api/ai/brand-consistency` reaches OpenRouter (matches existing
  endpoints' behavior — the placeholder env var passes the truthy check).

### Files touched

- `server/routes/ai.js` (added 2 endpoints + import)
- `server/routes/comments.js` (new)
- `server/routes/projectSnapshots.js` (new)
- `server/routes/exportAdapters.js` (new)
- `server/models/Comment.js` (new)
- `server/models/ProjectSnapshot.js` (new)
- `server/models/index.js` (registered new models + associations)
- `server/index.js` (3 new `app.use` lines)
- `client/src/App.jsx`
- `client/src/components/layout/Sidebar.jsx`
- `client/src/pages/ai/UsageAnalyticsPage.jsx` (new)
- `client/src/pages/ai/BrandConsistencyPage.jsx` (new)

### Remaining backlog after pass 5

- [PRODUCT-DECISION] Subscription & credit management — needs a Plan model
  and Stripe-or-similar integration.
- [PRODUCT-DECISION] Real-time collaboration (would need WebSocket infra).
- [NEEDS-CREDS] Actual YouTube / TikTok / Instagram upload calls (the
  adapter scaffolding is in place but outbound calls are not enabled in
  this build).
