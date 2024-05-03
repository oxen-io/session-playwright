import { expect } from '@playwright/test';
import { test_Alice_1W_no_network } from './setup/sessionTest';
import { clickOnTestIdWithText } from './utilities/utils';

test_Alice_1W_no_network('Switch themes', async ({ aliceWindow1 }) => {
  // Create
  // Check light theme colour is correct
  const darkThemeColor = aliceWindow1.locator('.inbox.index');
  await expect(darkThemeColor).toHaveCSS('background-color', 'rgb(27, 27, 27)');

  // Click theme button and change to dark theme
  await clickOnTestIdWithText(aliceWindow1, 'theme-section');
  // Check background colour of background to verify dark theme
  const lightThemeColor = aliceWindow1.locator('.inbox.index');
  await expect(lightThemeColor).toHaveCSS(
    'background-color',
    'rgb(255, 255, 255)',
  );

  // Toggle back to light theme
  await clickOnTestIdWithText(aliceWindow1, 'theme-section');
  // Check background colour again
  await expect(darkThemeColor).toHaveCSS('background-color', 'rgb(27, 27, 27)');
});
