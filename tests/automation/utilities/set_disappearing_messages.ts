import { Page } from '@playwright/test';
import { clickOnTestIdWithText, clickOnElement, waitForElement } from './utils';

export const setDisappearingMessages = async (window: Page) => {
  await clickOnTestIdWithText(window, 'conversation-options-avatar');
  await clickOnElement({
    window,
    strategy: 'data-testid',
    selector: 'disappearing-messages',
  });
  if ('1o1')
    await clickOnElement({
      window,
      strategy: 'data-testid',
      selector: 'disappearing-after-read-option',
    });
  // Check that 1 Day default is automatically selected
  const defaultTime = await waitForElement(
    window,
    'data-testid',
    'disappear-time-1-day-option',
  );
  await clickOnElement({
    window,
    strategy: 'data-testid',
    selector: 'disappear-set-button',
  });
  const checked = await defaultTime.isChecked();
  if (checked) {
    console.warn('Timer default time is correct');
  } else {
    throw new Error('Default timer not set correctly');
  }
  // Change timer to testing duration (10 seconds)
  await clickOnElement({
    window,
    strategy: 'data-testid',
    selector: 'disappear-time-1-minute-option',
  });
  await clickOnElement({
    window,
    strategy: 'data-testid',
    selector: 'disappear-set-button',
  });
};
