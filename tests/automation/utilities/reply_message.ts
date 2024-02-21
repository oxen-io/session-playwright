import { Page } from '@playwright/test';
import { sendMessage } from './message';
import {
  clickOnMatchingText,
  clickOnTextMessage,
  waitForTextMessage,
} from './utils';

export const replyTo = async (
  window: Page,
  textMessage: string,
  replyText: string,
) => {
  await waitForTextMessage(window, textMessage);
  await clickOnTextMessage(window, textMessage, true);
  await clickOnMatchingText(window, 'Reply');
  await sendMessage(window, replyText);
};
