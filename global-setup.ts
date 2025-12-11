import { FullConfig } from '@playwright/test';

/**
 * Global setup for Playwright tests
 * Validates environment variables and sets up project-level configuration
 */
async function globalSetup(config: FullConfig) {
  console.log('[START] Setting up global test configuration...');
  
  // Validate required environment variables
  const requiredEnvVars = [
    'OAUTH_BASE_URL',
    'OAUTH_TOKEN_ENDPOINT', 
    'CLIENT_ID',
    'CLIENT_SECRET'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
  
  console.log('[OK] Environment variables validated');
  console.log(`[URL] OAuth Base URL: ${process.env.OAUTH_BASE_URL}`);
  console.log(`[WEB] API Base URL: ${process.env.API_BASE_URL}`);
  console.log(`[KEY] Client ID: ${process.env.CLIENT_ID}`);
  console.log(`[AUTH] Client Secret: [CONFIGURED]`);
  console.log(`[TARGET] Scopes: ${process.env.DEFAULT_SCOPE}`);
  
  // You can add more global setup logic here
  // Like pre-authentication, database setup, etc.
}

export default globalSetup;