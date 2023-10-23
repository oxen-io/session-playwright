import { test } from '@playwright/test';
import { beforeAllClean } from './setup/beforeEach';
import { createGroup } from './setup/create_group';
import { newUser } from './setup/new_user';
import { openApp } from './setup/open';
import { sendMessage } from './utilities/message';
import { replyTo } from './utilities/reply_message';
import {
  clickOnElement,
  clickOnMatchingText,
  clickOnTestIdWithText,
  hasTextMessageBeenDeleted,
  lookForPartialTestId,
  typeIntoInput,
  waitForLoadingAnimationToFinish,
  waitForMatchingText,
  waitForTestIdWithText,
  waitForTextMessage,
} from './utilities/utils';
import { sleepFor } from '../promise_utils';

test.beforeEach(beforeAllClean);

test('Send image to group', async () => {
  const [windowA, windowB, windowC] = await openApp(3);
  const [userA, userB, userC] = await Promise.all([
    newUser(windowA, 'Alice'),
    newUser(windowB, 'Bob'),
    newUser(windowC, 'Charlie'),
  ]);
  const group = await createGroup(
    'Message checks',
    userA,
    windowA,
    userB,
    windowB,
    userC,
    windowC,
  );
  const testMessage = `${userA.userName} sending image to ${group.userName}`;
  const testReply = `${userB.userName} replying to image from ${userA.userName} in ${group.userName}`;
  await windowA.setInputFiles(
    "input[type='file']",
    'tests/automation/fixtures/test-image.png',
  );
  await typeIntoInput(windowA, 'message-input-text-area', testMessage);
  await clickOnElement({
    window: windowA,
    strategy: 'data-testid',
    selector: 'send-message-button',
  });
  await sleepFor(1000);
  await replyTo(windowB, testMessage, testReply);
  await waitForTextMessage(windowC, testMessage);
});

test('Send video to group', async () => {
  const [windowA, windowB, windowC] = await openApp(3);
  const [userA, userB, userC] = await Promise.all([
    newUser(windowA, 'Alice'),
    newUser(windowB, 'Bob'),
    newUser(windowC, 'Charlie'),
  ]);
  const group = await createGroup(
    'Message checks',
    userA,
    windowA,
    userB,
    windowB,
    userC,
    windowC,
  );
  const testMessage = `${userA.userName} sending video to ${group.userName}`;
  const testReply = `${userB.userName} replying to video from ${userA.userName} in ${group.userName}`;
  await windowA.setInputFiles(
    "input[type='file']",
    'tests/automation/fixtures/test-video.mp4',
  );
  await sleepFor(1000);

  await typeIntoInput(windowA, 'message-input-text-area', testMessage);
  await clickOnElement({
    window: windowA,
    strategy: 'data-testid',
    selector: 'send-message-button',
  });
  await sleepFor(1000);
  await replyTo(windowB, testMessage, testReply);
  await waitForLoadingAnimationToFinish(windowA, 'loading-animation');
});

test('Send document to group', async () => {
  const [windowA, windowB, windowC] = await openApp(3);
  const [userA, userB, userC] = await Promise.all([
    newUser(windowA, 'Alice'),
    newUser(windowB, 'Bob'),
    newUser(windowC, 'Charlie'),
  ]);
  const group = await createGroup(
    'Message checks',
    userA,
    windowA,
    userB,
    windowB,
    userC,
    windowC,
  );
  const testMessage = `${userA.userName} sending document to ${group.userName}`;
  const testReply = `${userB.userName} replying to document from ${userA.userName} in ${group.userName}`;
  await windowA.setInputFiles(
    "input[type='file']",
    'tests/automation/fixtures/test-file.pdf',
  );
  await typeIntoInput(windowA, 'message-input-text-area', testMessage);
  await clickOnElement({
    window: windowA,
    strategy: 'data-testid',
    selector: 'send-message-button',
  });
  await sleepFor(1000);
  await replyTo(windowB, testMessage, testReply);
});

test('Send voice message to group', async () => {
  const [windowA, windowB, windowC] = await openApp(3);
  const [userA, userB, userC] = await Promise.all([
    newUser(windowA, 'Alice'),
    newUser(windowB, 'Bob'),
    newUser(windowC, 'Charlie'),
  ]);
  const group = await createGroup(
    'Message checks',
    userA,
    windowA,
    userB,
    windowB,
    userC,
    windowC,
  );
  const testReply = `${userB.userName} replying to voice message from ${userA.userName} in ${group.userName}`;
  await clickOnElement({
    window: windowA,
    strategy: 'data-testid',
    selector: 'microphone-button',
  });
  await clickOnElement({
    window: windowA,
    strategy: 'data-testid',
    selector: 'session-toast',
  });
  await clickOnElement({
    window: windowA,
    strategy: 'data-testid',
    selector: 'enable-microphone',
  });
  await clickOnElement({
    window: windowA,
    strategy: 'data-testid',
    selector: 'message-section',
  });
  await clickOnElement({
    window: windowA,
    strategy: 'data-testid',
    selector: 'microphone-button',
  });
  await sleepFor(5000);
  await clickOnElement({
    window: windowA,
    strategy: 'data-testid',
    selector: 'end-voice-message',
  });
  await sleepFor(2000);
  await clickOnElement({
    window: windowA,
    strategy: 'data-testid',
    selector: 'send-message-button',
  });
  await sleepFor(1000);
  await lookForPartialTestId(windowB, 'audio-', true, true);
  await lookForPartialTestId(windowC, 'audio-');
  await clickOnMatchingText(windowB, 'Reply to message');
  await sendMessage(windowB, testReply);
  await waitForTextMessage(windowA, testReply);
});

test('Send GIF to group', async () => {
  const [windowA, windowB, windowC] = await openApp(3);
  const [userA, userB, userC] = await Promise.all([
    newUser(windowA, 'Alice'),
    newUser(windowB, 'Bob'),
    newUser(windowC, 'Charlie'),
  ]);
  const group = await createGroup(
    'Message checks',
    userA,
    windowA,
    userB,
    windowB,
    userC,
    windowC,
  );
  const testMessage = `${userA.userName} sending GIF to ${group.userName}`;

  const testReply = `${userB.userName} replying to GIF from ${userA.userName} in ${group.userName}`;
  await windowA.setInputFiles(
    "input[type='file']",
    'tests/automation/fixtures/test-gif.gif',
  );
  await sleepFor(100);
  await typeIntoInput(windowA, 'message-input-text-area', testMessage);

  await clickOnElement({
    window: windowA,
    strategy: 'data-testid',
    selector: 'send-message-button',
  });
  await sleepFor(1000);
  await replyTo(windowB, testMessage, testReply);
  await waitForTextMessage(windowA, testReply);
});

test('Send long text to group', async () => {
  const [windowA, windowB, windowC] = await openApp(3);
  const [userA, userB, userC] = await Promise.all([
    newUser(windowA, 'Alice'),
    newUser(windowB, 'Bob'),
    newUser(windowC, 'Charlie'),
  ]);
  const group = await createGroup(
    'Message checks',
    userA,
    windowA,
    userB,
    windowB,
    userC,
    windowC,
  );
  const longText =
    // eslint-disable-next-line max-len
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum quis lacinia mi. Praesent fermentum vehicula rhoncus. Aliquam ac purus lobortis, convallis nisi quis, pulvinar elit. Nam commodo eros in molestie lobortis. Donec at mattis est. In tempor ex nec velit mattis, vitae feugiat augue maximus. Nullam risus libero, bibendum et enim et, viverra viverra est. Suspendisse potenti. Sed ut nibh in sem rhoncus suscipit. Etiam tristique leo sit amet ullamcorper dictum. Suspendisse sollicitudin, lectus et suscipit eleifend, libero dui ultricies neque, non elementum nulla orci bibendum lorem. Suspendisse potenti. Aenean a tellus imperdiet, iaculis metus quis, pretium diam. Nunc varius vitae enim vestibulum interdum. In hac habitasse platea dictumst. Donec auctor sem quis eleifend fermentum. Vestibulum neque nulla, maximus non arcu gravida, condimentum euismod turpis. Cras ac mattis orci. Quisque ac enim pharetra felis sodales eleifend. Aliquam erat volutpat. Donec sit amet mollis nibh, eget feugiat ipsum. Integer vestibulum purus ac suscipit egestas. Duis vitae aliquet ligula.';
  const testReply = `${userB.userName} replying to long text message from ${userA.userName} in ${group.userName}`;
  await typeIntoInput(windowA, 'message-input-text-area', longText);
  await sleepFor(100);
  await clickOnElement({
    window: windowA,
    strategy: 'data-testid',
    selector: 'send-message-button',
  });
  await sleepFor(1000);
  await replyTo(windowB, longText, testReply);
  await waitForTextMessage(windowC, longText);
  await waitForTextMessage(windowC, testReply);
});

test('Unsend message to group', async () => {
  const [windowA, windowB, windowC] = await openApp(3);
  const [userA, userB, userC] = await Promise.all([
    newUser(windowA, 'Alice'),
    newUser(windowB, 'Bob'),
    newUser(windowC, 'Charlie'),
  ]);
  const group = await createGroup(
    'Message checks',
    userA,
    windowA,
    userB,
    windowB,
    userC,
    windowC,
  );
  const unsendMessage = `Testing unsend functionality in ${group.userName}`;
  await sendMessage(windowA, unsendMessage);
  await waitForTextMessage(windowB, unsendMessage);
  await waitForTextMessage(windowC, unsendMessage);
  await clickOnTestIdWithText(windowA, 'control-message', unsendMessage, true);
  await clickOnMatchingText(windowA, 'Delete for everyone');
  await clickOnElement({
    window: windowA,
    strategy: 'data-testid',
    selector: 'session-confirm-ok-button',
  });
  await waitForTestIdWithText(windowA, 'session-toast', 'Deleted');
  await sleepFor(1000);
  await waitForMatchingText(windowB, 'This message has been deleted');
  await waitForMatchingText(windowC, 'This message has been deleted');
});

test('Delete message to group', async () => {
  const [windowA, windowB, windowC] = await openApp(3);
  const [userA, userB, userC] = await Promise.all([
    newUser(windowA, 'Alice'),
    newUser(windowB, 'Bob'),
    newUser(windowC, 'Charlie'),
  ]);
  const group = await createGroup(
    'Message checks',
    userA,
    windowA,
    userB,
    windowB,
    userC,
    windowC,
  );
  const deletedMessage = `Testing delete message functionality in ${group.userName}`;
  await sendMessage(windowA, deletedMessage);
  await waitForTextMessage(windowB, deletedMessage);
  await waitForTextMessage(windowC, deletedMessage);
  await clickOnTestIdWithText(windowA, 'control-message', deletedMessage, true);
  await clickOnMatchingText(windowA, 'Delete just for me');
  await clickOnMatchingText(windowA, 'Delete');
  await waitForTestIdWithText(windowA, 'session-toast', 'Deleted');
  await hasTextMessageBeenDeleted(windowA, deletedMessage, 5000);
  await waitForMatchingText(windowB, deletedMessage);
  await waitForMatchingText(windowC, deletedMessage);
});
