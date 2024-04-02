import { Page } from '@playwright/test';
import { ConversationType, DisappearOptions } from '../types/testing';
import {
  clickOnElement,
  clickOnMatchingText,
  clickOnTestIdWithText,
  waitForElement,
} from './utils';

export const setDisappearingMessages = async (
  windowA: Page,
  [conversationType, timerType, timerDuration]: DisappearOptions,
  windowB?: Page,
) => {
  const enforcedType: ConversationType = conversationType;
  await clickOnTestIdWithText(windowA, 'conversation-options-avatar');
  await clickOnElement({
    window: windowA,
    strategy: 'data-testid',
    selector: 'disappearing-messages',
  });
  if (enforcedType === '1:1') {
    await clickOnElement({
      window: windowA,
      strategy: 'data-testid',
      selector: timerType,
    });
    // Check that 1 Day default is automatically selected (default time is only relevant to 1:1's)
    let defaultTime;
    if (timerType === 'disappear-after-read-option') {
      defaultTime = await waitForElement(
        windowA,
        'data-testid',
        'input-12-hours',
      );
    } else {
      defaultTime = await waitForElement(windowA, 'data-testid', 'input-1-day');
    }
    const checked = await defaultTime.isChecked();
    if (checked) {
      console.warn('Timer default time is correct');
    } else {
      throw new Error('Default timer not set correctly');
    }
  }

  // Change timer to testing duration (10 seconds)
  await clickOnElement({
    window: windowA,
    strategy: 'data-testid',
    selector: timerDuration,
  });
  await clickOnElement({
    window: windowA,
    strategy: 'data-testid',
    selector: 'disappear-set-button',
  });
  if (windowB) {
    await clickOnMatchingText(windowB, 'Follow Setting');
    await clickOnElement({
      window: windowB,
      strategy: 'data-testid',
      selector: 'session-confirm-ok-button',
    });
  }
};
