const sequelize = require('../config/database');
const { User } = require('../models');

const emailOf = (value) => String(value || '').trim().toLowerCase();
const passwordOf = () => String(
  process.env.BOOTSTRAP_ADMIN_PASSWORD
  || process.env.SEED_ADMIN_PASSWORD
  || process.env.ADMIN_PASSWORD
  || '',
);

function validate(email, password) {
  if (process.env.BOOTSTRAP_ACKNOWLEDGEMENT !== 'create-initial-admin') {
    throw new Error('BOOTSTRAP_ACKNOWLEDGEMENT=create-initial-admin is required');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    throw new Error('A valid BOOTSTRAP_ADMIN_EMAIL, SEED_ADMIN_EMAIL, or ADMIN_EMAIL is required');
  }
  if (password.length < 12 || password.length > 128
    || !/[a-z]/.test(password) || !/[A-Z]/.test(password)
    || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    throw new Error('The bootstrap password must be 12-128 characters and include upper, lower, number, and symbol classes');
  }
}

async function createAdmin() {
  const email = emailOf(
    process.env.BOOTSTRAP_ADMIN_EMAIL
    || process.env.SEED_ADMIN_EMAIL
    || process.env.ADMIN_EMAIL,
  );
  const password = passwordOf();
  validate(email, password);
  await sequelize.authenticate();
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    if (!existing.isActive || !(await existing.validPassword(password))) {
      throw new Error('The requested operator already exists with different credentials or is inactive; refusing to modify it');
    }
    console.log(`Operator already provisioned: ${email}`);
    return existing;
  }
  const user = await User.create({
    email,
    password,
    name: String(process.env.BOOTSTRAP_ADMIN_NAME || 'Runway Operator').trim() || 'Runway Operator',
    isActive: true,
  });
  console.log(`Operator provisioned: ${user.email}`);
  return user;
}

if (require.main === module) {
  createAdmin()
    .then(() => sequelize.close())
    .catch(async (error) => {
      console.error(error.message);
      await sequelize.close().catch(() => undefined);
      process.exitCode = 1;
    });
}

module.exports = { createAdmin };
