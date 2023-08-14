import { Page } from '@playwright/test';
import {
  clickOnMatchingText,
  clickOnTestIdWithText,
  hasElementBeenDeleted,
} from './utils';
import { Group } from '../types/testing';

export const leaveGroup = async (window: Page, group: Group) => {
  // go to three dots menu
  await clickOnTestIdWithText(window, 'three-dots-conversation-options');
  // Select Leave Group
  await clickOnMatchingText(window, 'Leave Group');
  // Confirm leave group
  await clickOnTestIdWithText(window, 'session-confirm-ok-button', 'OK');
  // check config message
  await hasElementBeenDeleted(
    window,
    'data-testid',
    'module-conversation__user__profile-name',
    group.userName,
    undefined,
  );
};
