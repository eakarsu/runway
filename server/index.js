require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const sequelize = require('./config/database');

// Import models to register associations
require('./models');

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/assets', require('./routes/assets'));
app.use('/api/video-generations', require('./routes/videoGenerations'));
app.use('/api/image-generations', require('./routes/imageGenerations'));
app.use('/api/templates', require('./routes/templates'));
app.use('/api/scripts', require('./routes/scripts'));
app.use('/api/storyboards', require('./routes/storyboards'));
app.use('/api/voiceovers', require('./routes/voiceovers'));
app.use('/api/style-presets', require('./routes/stylePresets'));
app.use('/api/exports', require('./routes/exports'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/spreadsheets', require('./routes/spreadsheets'));
app.use('/api/financial-models', require('./routes/financialModels'));
app.use('/api/plans', require('./routes/plans'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/scenarios', require('./routes/scenarios'));
app.use('/api/integrations', require('./routes/integrations'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.SERVER_PORT || 3001;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');

    await sequelize.sync({ alter: true });
    console.log('Database synced');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

module.exports = app;
