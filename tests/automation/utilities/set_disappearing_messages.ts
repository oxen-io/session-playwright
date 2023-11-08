import { Page } from '@playwright/test';
import { clickOnTestIdWithText, clickOnElement, waitForElement } from './utils';

export const setDisappearingMessages = async (window: Page) => {
  await clickOnTestIdWithText(window, 'conversation-options-avatar');
  await clickOnElement({
    window,
    strategy: 'data-testid',
    selector: 'disappearing-messages',
  });
  if ('1o1') {
    await clickOnElement({
      window,
      strategy: 'data-testid',
      selector: 'disappear-after-read-option',
    });
  }
  // Check that 1 Day default is automatically selected
  const defaultTime = await waitForElement(window, 'data-testid', '1-day');
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
    selector: 'time-option-1-minute',
  });
  await clickOnElement({
    window,
    strategy: 'data-testid',
    selector: 'disappear-set-button',
  });
};
