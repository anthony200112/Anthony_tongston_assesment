import dotenv from 'dotenv';

dotenv.config();

const required = ['MONGODB_URI', 'JWT_SECRET'];

const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  // eslint-disable-next-line no-console
  console.error(`Missing required env vars: ${missing.join(', ')}. Copy .env.example to .env and fill in values.`);
  process.exit(1);
}

export default {
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiry: '7d',
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  isProduction: process.env.NODE_ENV === 'production',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@tongston.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'Admin123!',
};
