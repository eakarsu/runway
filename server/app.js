const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const sequelize = require('./config/database');
const authenticate = require('./middleware/auth');

require('./models');

function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use((req, res, next) => {
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'no-referrer',
      'Cache-Control': 'no-store',
    });
    next();
  });
  app.use(cors({ origin: process.env.CORS_ORIGIN, methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allowedHeaders: ['Authorization', 'Content-Type', 'Idempotency-Key'] }));
  app.use(morgan(process.env.NODE_ENV === 'test' ? 'tiny' : 'combined'));
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: false, limit: '2mb' }));
  app.use((req, res, next) => {
    if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
      for (const protectedKey of ['id', 'userId', 'createdAt', 'updatedAt']) delete req.body[protectedKey];
    }
    next();
  });

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
  app.get('/api/ready', async (req, res) => {
    try { await sequelize.authenticate(); res.json({ status: 'ready' }); }
    catch { res.status(503).json({ error: 'Database unavailable', code: 'DATABASE_UNAVAILABLE' }); }
  });
  app.get('/api/boundary', (req, res) => res.json({
    workflow: 'private-project-review-version-and-export',
    prototypeRoutesEnabled: process.env.ENABLE_PROTOTYPE_ROUTES === 'true',
    legalDocumentProduct: false,
    exportProviderConfigured: Boolean(process.env.EXPORT_PROVIDER_URL && process.env.EXPORT_PROVIDER_TOKEN),
  }));

  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/projects', require('./routes/projects'));
  app.use('/api/projects', require('./routes/projectSnapshots'));
  app.use('/api/comments', require('./routes/comments'));
  app.use('/api/exports', require('./routes/exports'));

  if (process.env.ENABLE_PROTOTYPE_ROUTES === 'true') {
    app.use('/api/assets', require('./routes/assets'));
    app.use('/api/video-generations', require('./routes/videoGenerations'));
    app.use('/api/image-generations', require('./routes/imageGenerations'));
    app.use('/api/templates', require('./routes/templates'));
    app.use('/api/scripts', require('./routes/scripts'));
    app.use('/api/storyboards', require('./routes/storyboards'));
    app.use('/api/voiceovers', require('./routes/voiceovers'));
    app.use('/api/style-presets', require('./routes/stylePresets'));
    app.use('/api/ai', require('./routes/ai'));
    app.use('/api/spreadsheets', require('./routes/spreadsheets'));
    app.use('/api/financial-models', require('./routes/financialModels'));
    app.use('/api/plans', require('./routes/plans'));
    app.use('/api/reports', require('./routes/reports'));
    app.use('/api/scenarios', require('./routes/scenarios'));
    app.use('/api/integrations', require('./routes/integrations'));
    app.use('/api/export-adapters', require('./routes/exportAdapters'));
    app.use('/api/ai-extras', require('./routes/ai-extras'));
    app.use('/api', authenticate, require('./routes/gap-features'));
  }

  app.use('/api', authenticate, (req, res) => res.status(501).json({ error: 'Route is outside the governed workflow', code: 'PROTOTYPE_DISABLED' }));
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    console.error(error);
    return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  });
  app.use((req, res) => res.status(404).json({ error: 'Route not found', code: 'NOT_FOUND' }));
  return app;
}

module.exports = { createApp };
