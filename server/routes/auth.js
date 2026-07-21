const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const authenticate = require('../middleware/auth');
const { checkLoginRate, recordLoginFailure, clearLoginFailures } = require('../middleware/loginRateLimit');

const router = express.Router();
const dummyHash = '$2a$12$M7Z.W.8oNfHvc4ZcvWfZzO.J22hQQzF4W2B1qCxkeNu2PMSFXO6Yu';
const tokenOptions = {
  algorithm: 'HS256',
  expiresIn: '1h',
  issuer: 'runway-api',
  audience: 'runway-client',
};

const emailOf = (value) => String(value || '').trim().toLowerCase();
const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
const strongPassword = (value) => value.length >= 12
  && value.length <= 128
  && /[a-z]/.test(value)
  && /[A-Z]/.test(value)
  && /\d/.test(value)
  && /[^A-Za-z0-9]/.test(value);
const publicUser = (user) => ({ id: user.id, email: user.email, name: user.name });

router.post('/register', checkLoginRate, async (req, res) => {
  try {
    if (process.env.ALLOW_PUBLIC_REGISTRATION !== 'true') return res.status(403).json({ error: 'Public registration is disabled', code: 'REGISTRATION_DISABLED' });
    const email = emailOf(req.body?.email);
    const password = String(req.body?.password || '');
    const name = String(req.body?.name || '').trim();
    if (!validEmail(email) || !strongPassword(password) || name.length > 200) {
      return res.status(400).json({ error: 'Valid email, optional name, and a 12-128 character mixed-class password are required', code: 'INVALID_REGISTRATION' });
    }
    if (await User.findOne({ where: { email } })) return res.status(409).json({ error: 'Account cannot be created', code: 'ACCOUNT_EXISTS' });
    const user = await User.create({ email, password, name: name || email.split('@')[0], isActive: true });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, tokenOptions);
    res.status(201).json({ token, user: publicUser(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Account could not be created', code: 'REGISTRATION_FAILED' });
  }
});

router.post('/login', checkLoginRate, async (req, res) => {
  try {
    const email = emailOf(req.body?.email);
    const password = String(req.body?.password || '');
    if (!validEmail(email) || !password) return res.status(400).json({ error: 'Email and password are required', code: 'INVALID_LOGIN' });
    const user = await User.findOne({ where: { email } });
    const valid = await bcrypt.compare(password, user?.password || dummyHash);
    if (!user || !user.isActive || !valid) {
      recordLoginFailure(req, email);
      return res.status(401).json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
    }
    clearLoginFailures(req, email);
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, tokenOptions);
    res.json({ token, user: publicUser(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Authentication failed', code: 'LOGIN_FAILED' });
  }
});

router.get('/me', authenticate, (req, res) => res.json({ user: publicUser(req.user) }));

module.exports = router;
