import { Page } from '@playwright/test';
import { sendMessage } from './message';
import {
  clickOnMatchingText,
  clickOnTextMessage,
  waitForTextMessage,
} from './utils';

/**
 * Reply to a message and optionally wait for the reply to be received.
 * @param senderWindow send the message from this window
 * @param textMessage look for this message in senderWindow to reply to it
 * @param replyText reply with this message
 * @param receiverWindow if set, will wait until replyText is received from senderWindow
 *
 * Note: Most of the case, we want a receiverWindow argument to be given, to make the tests as reliable as possible
 */
export const replyTo = async ({
  replyText,
  textMessage,
  receiverWindow,
  senderWindow,
}: {
  senderWindow: Page;
  textMessage: string;
  replyText: string;
  receiverWindow: Page | null;
}) => {
  await waitForTextMessage(senderWindow, textMessage);
  await clickOnTextMessage(senderWindow, textMessage, true);
  await clickOnMatchingText(senderWindow, 'Reply');
  await sendMessage(senderWindow, replyText);
  if (receiverWindow) {
    await waitForTextMessage(receiverWindow, replyText);
  }
};
