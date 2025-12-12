import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Global timeout settings - increased for slower endpoints */
  timeout: 120000, // 2 minutes per test (for slower OBSCIM endpoint)
  expect: {
    timeout: 30000, // 30 seconds for assertions
  },
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Ignore HTTPS errors for API testing with self-signed certificates */
    ignoreHTTPSErrors: true,
    
    /* API Configuration from environment variables */
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'User-Agent': 'Playwright-API-Tests/1.0'
    },
  },

  /* Global test configuration - Project level parameters */
  globalSetup: require.resolve('./global-setup.ts'),

  /* Configure projects for API testing */
  projects: [
    {
      name: 'api-tests',
      testMatch: ['**/*scim-api.spec.ts', '**/*scim-api-poc.spec.ts', '**/*api.spec.ts'], // Main API tests
      use: {
        // API tests configuration
        baseURL: process.env.API_BASE_URL,
        extraHTTPHeaders: {
          'Accept': 'application/json',
          'User-Agent': 'Playwright-SCIM-API-Tests/1.0'
        },
      },
    },
    
    {
      name: 'auth-tests',
      testMatch: '**/*parameterization-test.api.spec.ts', // Authentication validation tests
      use: {
        baseURL: process.env.OAUTH_BASE_URL,
      },
    },
    
    /* Browser projects for UI tests (when added later) */
    // {
    //   name: 'chromium-ui',
    //   testMatch: '**/*.ui.spec.ts', // Only UI tests
    //   use: { ...devices['Desktop Chrome'] },
    // },
    // {
    //   name: 'firefox-ui', 
    //   testMatch: '**/*.ui.spec.ts', // Only UI tests
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit-ui',
    //   testMatch: '**/*.ui.spec.ts', // Only UI tests  
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
