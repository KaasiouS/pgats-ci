import { defineConfig } from '@playwright/test';

/**
 * Config padrão — usado no runner cloud (GitHub Actions ubuntu-latest).
 * Executa apenas os testes que não dependem de infraestrutura local.
 */
export default defineConfig({
  testDir: './tests',
  testMatch: ['**/public-api.spec.ts'],
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['allure-playwright', { resultsDir: 'allure-results' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    headless: true,
    trace: 'on-first-retry',
    ignoreHTTPSErrors: true,
  },
});
