import { defineConfig } from '@playwright/test';

/**
 * Config para self-hosted runner (Exercício 3).
 * Inclui TODOS os testes + sobe automaticamente o app local via webServer.
 * Este config FALHA em runners cloud porque http://localhost:3000
 * só existe na máquina onde o runner está instalado.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['allure-playwright', { resultsDir: 'allure-results' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    trace: 'on-first-retry',
    ignoreHTTPSErrors: true,
  },
  webServer: {
    command: 'npm run start:app',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 15000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
