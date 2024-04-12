import { test } from '@playwright/test';
import { sleepFor } from '../promise_utils';
import { beforeAllClean } from './setup/beforeEach';
import { createGroup } from './setup/create_group';
import { newUser } from './setup/new_user';
import { openApp } from './setup/open';
import { createContact } from './utilities/create_contact';
import { linkedDevice } from './utilities/linked_device';
import { sendMessage } from './utilities/message';
import { sendNewMessage } from './utilities/send_message';
import { setDisappearingMessages } from './utilities/set_disappearing_messages';
import {
  clickOnElement,
  clickOnTestIdWithText,
  doesTextIncludeString,
  hasTextMessageBeenDeleted,
  typeIntoInput,
  waitForTextMessage,
} from './utilities/utils';

test.beforeEach(beforeAllClean);

// test.afterEach(() => forceCloseAllWindows(windows));
// tslint:disable: no-console

test('Disappear after read 1:1', async () => {
  // Open App
  // Create User
  const [windowA, windowB] = await openApp(2);
  const [userA, userB] = await Promise.all([
    newUser(windowA, 'Alice'),
    newUser(windowB, 'Bob'),
  ]);
  const [windowC] = await linkedDevice(userA.recoveryPhrase);
  const testMessage =
    'Testing disappearing messages timer is working correctly';
  const controlMessage =
    'set your messages to disappear 10 seconds after they have been read';
  // Create Contact
  await createContact(windowA, windowB, userA, userB);
  // Click on conversation in linked device
  await clickOnTestIdWithText(
    windowC,
    'module-conversation__user__profile-name',
    userB.userName,
  );
  await clickOnTestIdWithText(windowA, 'conversation-options-avatar');
  await setDisappearingMessages(
    windowA,
    ['1:1', 'disappear-after-read-option', 'time-option-10-seconds'],
    windowB,
  );
  // Check control message is visible
  await doesTextIncludeString(
    windowA,
    'disappear-control-message',
    controlMessage,
  );
  await sleepFor(10000);
  // Control message should also disappear after 10 seconds
  await hasTextMessageBeenDeleted(windowA, controlMessage);
  // Send message
  await sendMessage(windowA, testMessage);
  // Check window B for message to confirm arrival
  // await clickOnTextMessage(windowB, testMessage);
  await waitForTextMessage(windowB, testMessage);
  // Wait 10 seconds to see if message is removed
  await sleepFor(10000);
  await hasTextMessageBeenDeleted(windowA, testMessage);
  // Check window B (need to refocus window)
  console.log(`Bring window B to front`);
  const message = 'Forcing window to front';
  await typeIntoInput(windowB, 'message-input-text-area', message);
  // click up arrow (send)
  await clickOnElement({
    window: windowB,
    strategy: 'data-testid',
    selector: 'send-message-button',
  });
  await sleepFor(10000);
  await hasTextMessageBeenDeleted(windowB, testMessage);
});

test('Disappear after send 1:1', async () => {
  // Open App
  // Create User
  const [windowA, windowB] = await openApp(2);
  const [userA, userB] = await Promise.all([
    newUser(windowA, 'Alice'),
    newUser(windowB, 'Bob'),
  ]);
  const [windowC] = await linkedDevice(userA.recoveryPhrase);
  const testMessage =
    'Testing disappearing messages timer is working correctly';
  const controlMessage =
    'set your messages to disappear 10 seconds after they have been sent';
  // Create Contact
  await createContact(windowA, windowB, userA, userB);
  // Click on conversation in linked device
  await clickOnTestIdWithText(
    windowC,
    'module-conversation__user__profile-name',
    userB.userName,
  );
  await setDisappearingMessages(
    windowA,
    ['1:1', 'disappear-after-send-option', 'time-option-10-seconds'],
    windowB,
  );
  // Check control message is correct and appearing
  await doesTextIncludeString(
    windowA,
    'disappear-control-message',
    controlMessage,
  );
  await sendMessage(windowA, testMessage);
  // Check message has appeared in receivers window and linked device
  await Promise.all([
    waitForTextMessage(windowB, testMessage),
    waitForTextMessage(windowC, testMessage),
  ]);
  // Wait 10 seconds for message to disappearing (should disappear on all devices at once)
  await sleepFor(10000);
  await Promise.all([
    hasTextMessageBeenDeleted(windowA, testMessage),
    hasTextMessageBeenDeleted(windowB, testMessage),
    hasTextMessageBeenDeleted(windowC, testMessage),
  ]);
});

test('Disappear after send groups', async () => {
  const [windowA, windowB, windowC] = await openApp(3);
  const [userA, userB, userC] = await Promise.all([
    newUser(windowA, 'Alice'),
    newUser(windowB, 'Bob'),
    newUser(windowC, 'Chloe'),
  ]);
  const [windowD] = await linkedDevice(userA.recoveryPhrase);
  const controlMessageText =
    'set messages to disappear 10 seconds after they have been sent';
  const testMessage = 'Testing disappearing messages in groups';
  const group = await createGroup(
    'Disappearing messages test',
    userA,
    windowA,
    userB,
    windowB,
    userC,
    windowC,
  );
  await clickOnTestIdWithText(
    windowD,
    'module-conversation__user__profile-name',
    group.userName,
  );
  await clickOnElement({
    window: windowA,
    strategy: 'data-testid',
    selector: 'conversation-options-avatar',
  });
  await setDisappearingMessages(windowA, [
    'group',
    'disappear-after-send-option',
    'time-option-10-seconds',
  ]);
  // Check control message is visible and correct
  await doesTextIncludeString(
    windowA,
    'disappear-control-message',
    controlMessageText,
  );
  await sendMessage(windowA, testMessage);
  await Promise.all([
    waitForTextMessage(windowB, testMessage),
    waitForTextMessage(windowC, testMessage),
    waitForTextMessage(windowD, testMessage),
  ]);
  // Wait 10 seconds for messages to disappear
  await sleepFor(10000);
  await Promise.all([
    hasTextMessageBeenDeleted(windowA, testMessage),
    hasTextMessageBeenDeleted(windowB, testMessage),
    hasTextMessageBeenDeleted(windowC, testMessage),
    hasTextMessageBeenDeleted(windowD, testMessage),
  ]);
});

test('Disappear after send note to self', async () => {
  const [windowA] = await openApp(1);
  const userA = await newUser(windowA, 'Alice');
  const [windowB] = await linkedDevice(userA.recoveryPhrase);
  const testMessage = 'Message to test note to self';
  const testMessageDisappear = 'Message testing disappearing messages';
  const controlMessageText =
    'set messages to disappear 10 seconds after they have been sent';
  // Open Note to self conversation
  await sendNewMessage(windowA, userA.sessionid, testMessage);
  // Check messages are syncing across linked devices
  await clickOnTestIdWithText(
    windowB,
    'module-conversation__user__profile-name',
    'Note to Self',
  );
  await waitForTextMessage(windowB, testMessage);
  // Enable disappearing messages
  await setDisappearingMessages(windowA, [
    'note-to-self',
    'disappear-after-send-option',
    'input-10-seconds',
  ]);
  // Check control message is visible and correct
  await doesTextIncludeString(
    windowA,
    'disappear-control-message',
    controlMessageText,
  );
  await sendMessage(windowA, testMessageDisappear);
  await waitForTextMessage(windowB, testMessageDisappear);
  await sleepFor(10000);
  await Promise.all([
    hasTextMessageBeenDeleted(windowA, testMessageDisappear),
    hasTextMessageBeenDeleted(windowB, testMessageDisappear),
  ]);
});
