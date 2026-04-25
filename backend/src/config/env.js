require('dotenv').config();

module.exports = {
  // Database
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'vpered_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
  },

  // Server
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // External APIs
  externalEval: {
    apiUrl: process.env.EXTERNAL_EVAL_API_URL || 'https://evaluation-service.example.com/api/v1/recommendations/evaluate',
    apiKey: process.env.EXTERNAL_EVAL_API_KEY || 'default-key',
  },

  // Email
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    user: process.env.SMTP_USER || 'test@gmail.com',
    password: process.env.SMTP_PASSWORD || '',
  },

  // URLs
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000/api/v1',
};
