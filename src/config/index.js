require('dotenv').config();

const requiredEnvVars = ['FACEBOOK_PAGE_ID', 'FACEBOOK_ACCESS_TOKEN'];

const missing = requiredEnvVars.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

module.exports = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  facebook: {
    pageId: process.env.FACEBOOK_PAGE_ID,
    accessToken: process.env.FACEBOOK_ACCESS_TOKEN,
    apiVersion: process.env.FACEBOOK_API_VERSION || 'v18.0',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },
};
