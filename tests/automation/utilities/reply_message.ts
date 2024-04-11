import { Page } from '@playwright/test';
import { sendMessage } from './message';
import {
  clickOnMatchingText,
  clickOnTextMessage,
  waitForTextMessage,
} from './utils';

/**
 * Reply to a message and optionally wait for the reply to be received.
 * @param windowSender send the message from this window
 * @param textMessage look for this message in windowSender to reply to it
 * @param replyText reply with this message
 * @param windowReceiver if set, will wait until replyText is received from windowSender
 *
 * Note: Most of the case, we want a windowReceiver argument to be given, to make the tests as reliable as possible
 */
export const replyTo = async (
  windowSender: Page,
  textMessage: string,
  replyText: string,
  windowReceiver: Page | null,
) => {
  await waitForTextMessage(windowSender, textMessage);
  await clickOnTextMessage(windowSender, textMessage, true);
  await clickOnMatchingText(windowSender, 'Reply');
  await sendMessage(windowSender, replyText);
  if (windowReceiver) {
    await waitForTextMessage(windowReceiver, replyText);
  }
};
