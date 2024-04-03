/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-import-module-exports */
import { defineConfig } from '@playwright/test';
import { isEmpty, toNumber } from 'lodash';

const useSessionReporter = !isEmpty(process.env.PLAYWRIGHT_CUSTOM_REPORTER);

export default defineConfig({
  timeout: 350000,
  globalTimeout: 6000000,
  reporter: [
    useSessionReporter ? ['./sessionReporter.ts'] : ['list'],
    ['allure-playwright'],
  ],
  testDir: './tests/automation',
  testIgnore: '*.js',
  outputDir: './tests/automation/test-results',
  retries: process.env.PLAYWRIGHT_RETRIES_COUNT
    ? toNumber(process.env.PLAYWRIGHT_RETRIES_COUNT)
    : 0,

  workers: toNumber(process.env.PLAYWRIGHT_WORKER_COUNT) || 3,
  reportSlowTests: null,
});
