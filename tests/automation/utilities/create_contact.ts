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
  // Note: when creating a contact, we want to make sure both sides are friends when we finish this function,
  // so passing the windowA here is very important, so we wait for windowA to have received the reply
  await replyTo({
    windowSender: windowB,
    textMessage: testMessage,
    replyText: testReply,
    windowReceiver: windowA,
  });
};
