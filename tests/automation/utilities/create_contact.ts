import { Page } from '@playwright/test';
import { User } from '../types/testing';
import { replyTo } from './reply_message';
import { sendNewMessage } from './send_message';
import { clickOnElement, clickOnTestIdWithText } from './utils';

export const createContact = async (
  windowA: Page,
  windowB: Page,
  userA: User,
  userB: User,
) => {
  const testMessage = `${userA.userName} to ${userB.userName}`;
  const testReply = `${userB.userName} to ${userA.userName}`;
  // User A sends message to User B
  await sendNewMessage(windowA, userB.sessionid, testMessage);
  await clickOnElement({
    window: windowB,
    strategy: 'data-testid',
    selector: 'message-request-banner',
  });
  await clickOnTestIdWithText(
    windowB,
    'module-conversation__user__profile-name',
    userA.userName,
  );
  await clickOnElement({
    window: windowB,
    strategy: 'data-testid',
    selector: 'accept-message-request',
  });
  await replyTo(windowB, testMessage, testReply);
  await clickOnTestIdWithText(windowA, 'new-conversation-button');
};
