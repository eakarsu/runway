// AI Extras — Custom Feature Suggestions (batch 11)
// Multi-Scene Video Assembly, A/B Performance Prediction, Brand Consistency,
// Real-Time Collaboration, Platform-Specific Export Optimizer, Subscription/Credits.

const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');

async function callLLM(prompt, opts = {}) {
  if (!process.env.OPENROUTER_API_KEY) {
    const e = new Error('OPENROUTER_API_KEY not configured');
    e.status = 503;
    throw e;
  }
  const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3001',
      'X-Title': 'Runway AI Extras',
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: opts.maxTokens || 1500,
    }),
  });
  if (!r.ok) throw new Error(`OpenRouter error: ${r.status} - ${await r.text()}`);
  const data = await r.json();
  return {
    raw: data.choices?.[0]?.message?.content || '',
    model: data.model,
    usage: data.usage,
  };
}

function fail(res, e) { res.status(e?.status || 500).json({ error: e?.message || 'AI failed' }); }

// 1) Multi-Scene Video Assembly Agent
router.post('/multi-scene-assembly', authenticate, async (req, res) => {
  try {
    const { sceneClips = [], music, voiceoverScript, targetPlatform = 'youtube' } = req.body || {};
    if (!sceneClips.length) return res.status(400).json({ error: 'sceneClips[] required' });
    const prompt = `You are a video assembly director. Given clips, music, voiceover and target platform (${targetPlatform}), produce a JSON cut-list with transitions, durations, captions, and music cues. Clips: ${JSON.stringify(sceneClips).slice(0, 4000)} Music: ${music || 'none'} VO: ${(voiceoverScript || '').slice(0, 2000)}`;
    const out = await callLLM(prompt, { maxTokens: 1800 });
    res.json(out);
  } catch (e) { fail(res, e); }
});

// 2) Performance Prediction & A/B Testing
router.post('/ab-performance-predict', authenticate, async (req, res) => {
  try {
    const { variants = [], audience = 'general', platform = 'instagram' } = req.body || {};
    if (variants.length < 2) return res.status(400).json({ error: 'at least 2 variants required' });
    const prompt = `You are a video performance forecaster for ${platform}. Predict each variant\'s expected engagement (CTR, watch-time, share-rate) and pick a winner for audience ${audience}. Output JSON. Variants: ${JSON.stringify(variants).slice(0, 5000)}`;
    const out = await callLLM(prompt, { maxTokens: 1500 });
    res.json(out);
  } catch (e) { fail(res, e); }
});

// 3) Brand Consistency Checker
router.post('/brand-consistency', authenticate, async (req, res) => {
  try {
    const { brandGuide = {}, generationDescriptions = [] } = req.body || {};
    if (!generationDescriptions.length) return res.status(400).json({ error: 'generationDescriptions[] required' });
    const prompt = `You are a brand-style auditor. Compare each generated asset description vs. brandGuide (color palette, typography, tone). Flag deviations and suggest fixes. Output JSON. BrandGuide: ${JSON.stringify(brandGuide).slice(0, 2000)} Generations: ${JSON.stringify(generationDescriptions).slice(0, 5000)}`;
    const out = await callLLM(prompt, { maxTokens: 1500 });
    res.json(out);
  } catch (e) { fail(res, e); }
});

// 4) Real-Time Collaboration — track presence + comment threads.
const presence = new Map(); // projectId -> Map<userId, lastSeenISO>
const threads = new Map(); // commentId -> { messages: [...] }
router.post('/presence/heartbeat', authenticate, (req, res) => {
  const { projectId, userId } = req.body || {};
  if (!projectId || !userId) return res.status(400).json({ error: 'projectId and userId required' });
  const m = presence.get(projectId) || new Map();
  m.set(userId, new Date().toISOString());
  presence.set(projectId, m);
  res.json({ active: Array.from(m.entries()).map(([uid, ts]) => ({ userId: uid, lastSeen: ts })) });
});
router.post('/comments/:commentId/reply', authenticate, (req, res) => {
  const { commentId } = req.params;
  const { authorId, message } = req.body || {};
  if (!authorId || !message) return res.status(400).json({ error: 'authorId and message required' });
  const t = threads.get(commentId) || { messages: [] };
  t.messages.push({ authorId, message, at: new Date().toISOString() });
  threads.set(commentId, t);
  res.json({ thread: t });
});

// 5) Platform-Specific Export Optimizer
router.post('/platform-export-optimize', authenticate, async (req, res) => {
  try {
    const { sourceAssetMeta = {}, platforms = ['tiktok', 'instagram', 'youtube'] } = req.body || {};
    const prompt = `You are an export config generator. For each platform, produce JSON: resolution, aspectRatio, maxDuration, recommendedCaptions, codec, bitrate. Asset: ${JSON.stringify(sourceAssetMeta).slice(0, 1500)} Platforms: ${platforms.join(',')}`;
    const out = await callLLM(prompt, { maxTokens: 1200 });
    res.json(out);
  } catch (e) { fail(res, e); }
});

// 6) Subscription & Credit Management
// TODO: configure credentials — STRIPE_SECRET_KEY for actual billing.
const wallets = new Map();
router.post('/credits/grant', authenticate, (req, res) => {
  const { userId, credits, reason = 'topup' } = req.body || {};
  if (!userId || !credits) return res.status(400).json({ error: 'userId and credits required' });
  const w = wallets.get(userId) || { userId, balance: 0, history: [] };
  w.balance += Number(credits);
  w.history.push({ at: new Date().toISOString(), delta: Number(credits), reason });
  wallets.set(userId, w);
  res.json({ wallet: w });
});
router.post('/credits/consume', authenticate, (req, res) => {
  const { userId, credits, feature } = req.body || {};
  const w = wallets.get(userId);
  if (!w) return res.status(404).json({ error: 'wallet not found' });
  if (w.balance < Number(credits)) return res.status(402).json({ error: 'insufficient credits', balance: w.balance });
  w.balance -= Number(credits);
  w.history.push({ at: new Date().toISOString(), delta: -Number(credits), feature });
  res.json({ wallet: w });
});
router.get('/credits/:userId', authenticate, (req, res) => {
  res.json({ wallet: wallets.get(req.params.userId) || { userId: req.params.userId, balance: 0, history: [] } });
});

module.exports = router;
