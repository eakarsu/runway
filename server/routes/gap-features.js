// === Batch 11 Gaps & Frontend Mounts ===
// Gap features (AI counterparts + Non-AI features) for runway.
// Lazy gap_features table (in-memory), OpenRouter via native fetch.

const express = require('express');
const router = express.Router();

const gapFeatures = new Map();

async function llm(systemPrompt, userMsg, maxTokens = 1400) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) { const e = new Error('OPENROUTER_API_KEY not configured'); e.status = 503; throw e; }
  const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';
  const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json', 'HTTP-Referer': 'http://localhost:3000', 'X-Title': 'runway Gap Features' },
    body: JSON.stringify({ model, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMsg }], max_tokens: maxTokens }),
  });
  const data = await r.json();
  if (data && data.error) throw new Error(data.error.message || 'LLM error');
  return (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
}

function track(slug, payload) {
  const list = gapFeatures.get(slug) || [];
  list.push({ at: new Date().toISOString(), payload });
  gapFeatures.set(slug, list);
}

function safe(res, e) { return res.status((e && e.status) || 500).json({ error: (e && e.message) || 'request failed' }); }

// ---- AI Gap Counterparts ----

router.post('/gap-auto-subtitles', async (req, res) => {
  try {
    const body = req.body || {};
    const sys = "You generate timecoded subtitles from video transcripts. Output WebVTT.";
    const user = `Body: ${JSON.stringify(body).slice(0, 4000)}`;
    const out = await llm(sys, user);
    track('auto-subtitles', { keys: Object.keys(body) });
    res.json({ subtitles: out });
  } catch (e) { safe(res, e); }
});

router.post('/gap-music-recommender', async (req, res) => {
  try {
    const body = req.body || {};
    const sys = "You recommend royalty-free music tracks matching a scene mood and tempo.";
    const user = `Body: ${JSON.stringify(body).slice(0, 4000)}`;
    const out = await llm(sys, user);
    track('music-recommender', { keys: Object.keys(body) });
    res.json({ tracks: out });
  } catch (e) { safe(res, e); }
});

router.post('/gap-scene-transition-suggester', async (req, res) => {
  try {
    const body = req.body || {};
    const sys = "You suggest scene transitions for pacing.";
    const user = `Body: ${JSON.stringify(body).slice(0, 4000)}`;
    const out = await llm(sys, user);
    track('scene-transition-suggester', { keys: Object.keys(body) });
    res.json({ transitions: out });
  } catch (e) { safe(res, e); }
});

router.post('/gap-engagement-predictor', async (req, res) => {
  try {
    const body = req.body || {};
    const sys = "You predict engagement for a video given hook, length, captions, and platform.";
    const user = `Body: ${JSON.stringify(body).slice(0, 4000)}`;
    const out = await llm(sys, user);
    track('engagement-predictor', { keys: Object.keys(body) });
    res.json({ prediction: out });
  } catch (e) { safe(res, e); }
});

router.post('/gap-brand-style-checker', async (req, res) => {
  try {
    const body = req.body || {};
    const sys = "You analyze color/typography/tone consistency across generations.";
    const user = `Body: ${JSON.stringify(body).slice(0, 4000)}`;
    const out = await llm(sys, user);
    track('brand-style-checker', { keys: Object.keys(body) });
    res.json({ flags: out });
  } catch (e) { safe(res, e); }
});

// ---- Non-AI Gap Features ----

router.post('/gap-realtime-collab', (req, res) => {
  const body = req.body || {};
  const record = { id: 'realtime-collab_' + Date.now(), ...body, createdAt: new Date().toISOString() };
  track('realtime-collab', record);
  res.json({ session: record, status: 'recorded' });
});

router.post('/gap-review-approval', (req, res) => {
  const body = req.body || {};
  const record = { id: 'review-approval_' + Date.now(), ...body, createdAt: new Date().toISOString() };
  track('review-approval', record);
  res.json({ thread: record, status: 'recorded' });
});

router.post('/gap-diff-restore-ui', (req, res) => {
  const body = req.body || {};
  const record = { id: 'diff-restore-ui_' + Date.now(), ...body, createdAt: new Date().toISOString() };
  track('diff-restore-ui', record);
  res.json({ snapshot: record, status: 'recorded' });
});

router.post('/gap-platform-publish', (req, res) => {
  const body = req.body || {};
  const record = { id: 'platform-publish_' + Date.now(), ...body, createdAt: new Date().toISOString() };
  track('platform-publish', record);
  res.json({ publish: record, status: 'recorded' });
});

router.post('/gap-team-permissions', (req, res) => {
  const body = req.body || {};
  const record = { id: 'team-permissions_' + Date.now(), ...body, createdAt: new Date().toISOString() };
  track('team-permissions', record);
  res.json({ role: record, status: 'recorded' });
});

router.post('/gap-usage-analytics', (req, res) => {
  const body = req.body || {};
  const record = { id: 'usage-analytics_' + Date.now(), ...body, createdAt: new Date().toISOString() };
  track('usage-analytics', record);
  res.json({ metric: record, status: 'recorded' });
});

router.get('/gap-features/_audit', (req, res) => {
  const rows = [];
  for (const [k, v] of gapFeatures.entries()) rows.push({ feature: k, events: v.length });
  res.json({ rows });
});

module.exports = router;
