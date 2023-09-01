/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-import-module-exports */
import { PlaywrightTestConfig } from '@playwright/test';
import { toNumber } from 'lodash';

const config: PlaywrightTestConfig = {
  timeout: 350000,
  globalTimeout: 6000000,
  reporter: [['list'], ['allure-playwright']],
  testDir: './tests/automation',
  testIgnore: '*.js',
  outputDir: './tests/automation/test-results',
  retries: process.env.PLAYWRIGHT_RETRIES_COUNT
    ? toNumber(process.env.PLAYWRIGHT_RETRIES_COUNT)
    : 0,

  workers: toNumber(process.env.PLAYWRIGHT_WORKER_COUNT) || 3,
  reportSlowTests: null,
};

module.exports = config;
