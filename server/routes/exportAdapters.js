// Apply pass 5 — platform export adapters.
// NEEDS-CREDS: each platform requires its own OAuth credentials. The route
// layer accepts a request and returns 503 with the missing env var name when
// credentials are not configured. With credentials present it would call the
// respective platform API; for now it logs the intent and returns 501 so the
// gating contract is testable end-to-end without making outbound calls.
//
// Required env vars (per-platform; checked at request time):
//   YouTube:   YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REFRESH_TOKEN
//   TikTok:    TIKTOK_CLIENT_KEY,  TIKTOK_CLIENT_SECRET,  TIKTOK_ACCESS_TOKEN
//   Instagram: INSTAGRAM_ACCESS_TOKEN, INSTAGRAM_BUSINESS_ACCOUNT_ID
const express = require('express');
const authenticate = require('../middleware/auth');

const router = express.Router();

const PLATFORM_CREDS = {
  youtube: ['YOUTUBE_CLIENT_ID', 'YOUTUBE_CLIENT_SECRET', 'YOUTUBE_REFRESH_TOKEN'],
  tiktok: ['TIKTOK_CLIENT_KEY', 'TIKTOK_CLIENT_SECRET', 'TIKTOK_ACCESS_TOKEN'],
  instagram: ['INSTAGRAM_ACCESS_TOKEN', 'INSTAGRAM_BUSINESS_ACCOUNT_ID'],
};

function findMissingEnv(platform) {
  const required = PLATFORM_CREDS[platform];
  if (!required) return ['unknown-platform'];
  return required.filter((k) => !process.env[k]);
}

router.post('/:platform', authenticate, async (req, res) => {
  const platform = String(req.params.platform || '').toLowerCase();
  if (!PLATFORM_CREDS[platform]) {
    return res.status(400).json({
      error: 'Unsupported platform',
      supported: Object.keys(PLATFORM_CREDS),
    });
  }
  const missing = findMissingEnv(platform);
  if (missing.length > 0) {
    return res.status(503).json({
      error: `${platform} credentials not configured`,
      missing,
    });
  }
  // Credentials present: real upload would happen here. Return 501 so the
  // gating contract is testable without making outbound API calls.
  return res.status(501).json({
    error: 'Adapter present but upload implementation not enabled in this build',
    platform,
  });
});

router.get('/status', authenticate, async (req, res) => {
  const status = {};
  for (const platform of Object.keys(PLATFORM_CREDS)) {
    const missing = findMissingEnv(platform);
    status[platform] = {
      configured: missing.length === 0,
      missing,
    };
  }
  res.json({ success: true, status });
});

module.exports = router;
