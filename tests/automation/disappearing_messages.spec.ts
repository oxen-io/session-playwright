import { test } from '@playwright/test';
import { sleepFor } from '../promise_utils';
import { beforeAllClean } from './setup/beforeEach';
import { createGroup } from './setup/create_group';
import { newUser } from './setup/new_user';
import { openApp } from './setup/open';
import { createContact } from './utilities/create_contact';
import { linkedDevice } from './utilities/linked_device';
import { sendMessage } from './utilities/message';
import {
  clickOnElement,
  clickOnMatchingText,
  clickOnTestIdWithText,
  doesTextIncludeString,
  hasTextMessageBeenDeleted,
  waitForControlMessageWithText,
  waitForElement,
  waitForTestIdWithText,
  waitForTextMessage,
} from './utilities/utils';

test.beforeEach(beforeAllClean);

// test.afterEach(() => forceCloseAllWindows(windows));
// tslint:disable: no-console

const testMessage = 'Test-Message- (A -> B) ';
// const testReply = 'Reply-Test-Message- (B -> A)';
const sentMessage = `${testMessage}${Date.now()}`;
// const sentReplyMessage = `${testReply} :${Date.now()}`;

test.skip('Disappearing messages legacy', async () => {
  // Open App
  // Create User
  const [windowA, windowB] = await openApp(2);
  const [userA, userB] = await Promise.all([
    newUser(windowA, 'Alice'),
    newUser(windowB, 'Bob'),
  ]);
  // Create Contact
  await createContact(windowA, windowB, userA, userB);
  // Need to wait for contact approval
  await sleepFor(5000);
  // Click on user's avatar to open conversation options
  await clickOnTestIdWithText(windowA, 'conversation-options-avatar');
  // Select disappearing messages drop down
  await clickOnMatchingText(windowA, 'Disappearing messages');
  // Select 5 seconds
  await clickOnMatchingText(windowA, '5 seconds');
  // Click chevron to close menu
  await clickOnTestIdWithText(windowA, 'back-button-conversation-options');
  // Check config message
  await waitForTestIdWithText(
    windowA,
    'control-message',
    'You set the disappearing message timer to 5 seconds',
  );
  await waitForTestIdWithText(
    windowB,
    'control-message',
    `${userA.userName} set the disappearing message timer to 5 seconds`,
  );
  await sleepFor(500);
  // Check top right hand corner indicator
  await waitForTestIdWithText(
    windowA,
    'disappearing-messages-indicator',
    '5 seconds',
  );
  // Send message
  await sendMessage(windowA, sentMessage);
  // Check timer is functioning
  await sleepFor(6000);
  // Verify message is deleted
  await hasTextMessageBeenDeleted(windowA, sentMessage, 3000);
  // focus window B
  await windowA.close();
  await windowB.bringToFront();
  await clickOnTestIdWithText(
    windowB,
    'control-message',
    `${userA.userName} set the disappearing message timer to 5 seconds`,
  );
  await hasTextMessageBeenDeleted(windowB, sentMessage, 5000);
});

test.skip('Disappear after read', async () => {
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
    'has set messages to disappear 1 minute after they have been read';
  // Create Contact
  await createContact(windowA, windowB, userA, userB);
  // Click on conversation in linked device
  await clickOnTestIdWithText(
    windowC,
    'module-conversation__user__profile-name',
    userB.userName,
  );
  await clickOnTestIdWithText(windowA, 'conversation-options-avatar');
  await clickOnElement(windowA, 'data-testid', 'disappearing-messages');
  await clickOnElement(
    windowA,
    'data-testid',
    'disappearing-after-read-option',
  );
  // Check that 1 Day default is automatically selected
  const defaultTime = await waitForElement(
    windowA,
    'data-testid',
    'disappear-time-1-day-option',
  );
  const checked = await defaultTime.isChecked();
  if (checked) {
    console.warn('Timer default time is correct');
  } else {
    throw new Error('Default timer not set correctly');
  }
  // Change timer to testing duration (10 seconds)
  await clickOnElement(
    windowA,
    'data-testid',
    'disappear-time-1-minute-option',
  );
  // Check control message is visible
  await doesTextIncludeString(windowA, 'control-message', controlMessage);
  await sleepFor(60000);
  // Control message should also disappearing after 10 seconds
  await hasTextMessageBeenDeleted(windowA, controlMessage);
  // Send message
  await sendMessage(windowA, testMessage);
  // Check window B for message to confirm arrival
  await waitForTextMessage(windowB, testMessage);
  // Wait 10 seconds to see if message is removed
  await sleepFor(60000);
  await hasTextMessageBeenDeleted(windowA, testMessage);
  // Check window B
  await hasTextMessageBeenDeleted(windowB, testMessage);
});

test.skip('Disappear after send', async () => {
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
    'has set messages to disappear 10 seconds after they have been sent';
  // Create Contact
  await createContact(windowA, windowB, userA, userB);
  // Click on conversation in linked device
  await clickOnTestIdWithText(
    windowC,
    'module-conversation__user__profile-name',
    userB.userName,
  );
  await clickOnTestIdWithText(windowA, 'conversation-options-avatar');
  await clickOnElement(windowA, 'data-testid', 'disappearing-messages');
  await clickOnElement(
    windowA,
    'data-testid',
    'disappearing-after-send-options',
  );
  const defaultTime = await waitForElement(
    windowA,
    'data-testid',
    'disappear-time-1-day-option',
  );
  const checked = await defaultTime.isChecked();
  if (checked) {
    console.warn('Default time is correct');
  } else {
    throw new Error('Default timer is NOT set correctly');
  }
  // Change timer to 1 minute
  await clickOnElement(
    windowA,
    'data-testid',
    'disappear-time-10-seconds-option',
  );
  // Check control message is correct and appearing
  await waitForControlMessageWithText(windowA, controlMessage);
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

test.skip('Disappear after read groups', async () => {
  const [windowA, windowB, windowC] = await openApp(3);
  const [userA, userB, userC] = await Promise.all([
    newUser(windowA, 'Alice'),
    newUser(windowB, 'Bob'),
    newUser(windowC, 'Chloe'),
  ]);
  const [windowD] = await linkedDevice(userA.recoveryPhrase);
  const controlMessageText =
    'has set messages to disappear 10 seconds after they have been sent';
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
  await clickOnElement(windowA, 'data-testid', 'conversation-options-avatar');
  await clickOnElement(windowA, 'data-testid', 'disappearing-messages');
  // Check if default is set
  const defaultTime = await waitForElement(
    windowA,
    'data-testid',
    'disappear-time-1-day-option',
  );
  const checked = await defaultTime.isChecked();
  if (checked) {
    console.warn('Default time is correct');
  } else {
    throw new Error('Default timer is NOT set correctly');
  }
  await waitForControlMessageWithText(windowA, controlMessageText);
  // Change disappearing message timer to 10 seconds
  await clickOnElement(
    windowA,
    'data-testid',
    'disappear-time-10-seconds-option',
  );
  await sendMessage(windowA, testMessage);
  // Has message been received by all group members and linked device?
  // Read message in window B and linked device
  await Promise.all([
    waitForTextMessage(windowB, testMessage),
    waitForTextMessage(windowD, testMessage),
  ]);
  // Therefore message in window A and B (plus window D, linked device) should delete after 10 seconds (plus buffer)
  await sleepFor(15000);
  await Promise.all([
    hasTextMessageBeenDeleted(windowA, testMessage),
    hasTextMessageBeenDeleted(windowB, testMessage),
    hasTextMessageBeenDeleted(windowD, testMessage),
  ]);
  // Next read message in window C, wait 10 seconds and then check for deletion
  await waitForTextMessage(windowC, testMessage);
  await sleepFor(10000);
  await hasTextMessageBeenDeleted(windowC, testMessage);
});

test.skip('Disappear after send groups', async () => {
  const [windowA, windowB, windowC] = await openApp(3);
  const [userA, userB, userC] = await Promise.all([
    newUser(windowA, 'Alice'),
    newUser(windowB, 'Bob'),
    newUser(windowC, 'Chloe'),
  ]);
  const [windowD] = await linkedDevice(userA.recoveryPhrase);
  const controlMessageText =
    'has set messages to disappear 10 seconds after they have been sent';
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
  await clickOnElement(windowA, 'data-testid', 'conversation-options-avatar');
  await clickOnElement(windowA, 'data-testid', 'disappearing-messages');
  await clickOnElement(
    windowA,
    'data-testid',
    'disappearing-after-send-options',
  );
  const defaultTime = await waitForElement(
    windowA,
    'data-testid',
    'disappear-time-1-day-option',
  );
  const checked = await defaultTime.isChecked();
  if (checked) {
    console.warn('Default time is correct');
  } else {
    throw new Error('Default timer is NOT set correctly');
  }
  // Select 10 seconds timer
  await clickOnElement(
    windowA,
    'data-testid',
    'disappear-time-10-seconds-option',
  );
  // Check control message is visible and correct
  await waitForControlMessageWithText(windowA, controlMessageText);
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

test.skip('Disappear after send note to self', async () => {
  const [windowA] = await openApp(1);
  const userA = await newUser(windowA, 'Alice');
  const [windowB] = await linkedDevice(userA.recoveryPhrase);
  const testMessage = 'Message to test note to self';
  const testMessageDisappear = 'Message testing disappearing messages';
  // Open Note to self conversation
  await createContact(windowA, windowB, userA, userA);
  // Check messages are syncing across linked devices
  await sendMessage(windowA, testMessage);
  await waitForTextMessage(windowB, testMessage);
  // Enable disappearing messages
  await clickOnElement(windowA, 'data-testid', 'conversation-options-avatar');
  await clickOnElement(windowA, 'data-testid', 'disappearing-messages');
  await clickOnElement(
    windowA,
    'data-testid',
    'disappearing-after-send-options',
  );
  // Check default time is correct
  const defaultTime = await waitForElement(
    windowA,
    'data-testid',
    'disappear-time-1-day-option',
  );
  const checked = await defaultTime.isChecked();
  if (checked) {
    console.warn('Default time is correct');
  } else {
    throw new Error('Default timer is NOT set correctly');
  }
  await clickOnElement(
    windowA,
    'data-testid',
    'disappear-time-10-seconds-option',
  );
  // Check control message is visible and correct
  await waitForControlMessageWithText(windowA, testMessageDisappear);
  await sendMessage(windowA, testMessage);
  await waitForTextMessage(windowB, testMessage);
  await sleepFor(10000);
  await Promise.all([
    hasTextMessageBeenDeleted(windowA, testMessageDisappear),
    hasTextMessageBeenDeleted(windowB, testMessageDisappear),
  ]);
});
