import { Page } from '@playwright/test';
import { Group } from '../types/testing';
import {
  clickOnMatchingText,
  clickOnTestIdWithText,
  hasElementBeenDeleted,
} from './utils';
import { englishStrippedStr } from '../../locale/localizedString';

export const leaveGroup = async (window: Page, group: Group) => {
  // go to three dots menu
  await clickOnTestIdWithText(window, 'conversation-options-avatar');
  // Select Leave Group
  await clickOnMatchingText(
    window,
    englishStrippedStr('groupLeave').toString(),
  );
  // Confirm leave group
  await clickOnTestIdWithText(
    window,
    'session-confirm-ok-button',
    englishStrippedStr('leave').toString(),
  );
  // check config message
  await hasElementBeenDeleted(
    window,
    'data-testid',
    'module-conversation__user__profile-name',
    undefined,
    group.userName,
  );
};
