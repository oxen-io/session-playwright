import { sleepFor } from '../promise_utils';
import { newUser } from './setup/new_user';
import { sessionTestTwoWindows } from './setup/sessionTest';
import { createContact } from './utilities/create_contact';
import { sendMessage } from './utilities/message';
import { replyTo } from './utilities/reply_message';
import {
  clickOnElement,
  clickOnMatchingText,
  clickOnTestIdWithText,
  clickOnTextMessage,
  hasTextMessageBeenDeleted,
  measureSendingTime,
  typeIntoInput,
  waitForLoadingAnimationToFinish,
  waitForMatchingText,
  waitForTestIdWithText,
  waitForTextMessage,
} from './utilities/utils';

sessionTestTwoWindows('Send image 1:1', async ([windowA, windowB]) => {
  const [userA, userB] = await Promise.all([
    newUser(windowA, 'Alice'),
    newUser(windowB, 'Bob'),
  ]);
  const testMessage = `${userA.userName} sending image to ${userB.userName}`;
  const testReply = `${userB.userName} replying to image from ${userA.userName}`;
  await createContact(windowA, windowB, userA, userB);

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
  // Click on untrusted attachment in window B
  await sleepFor(1000);
  await clickOnMatchingText(windowB, 'Click to download media');
  await clickOnTestIdWithText(windowB, 'session-confirm-ok-button');
  await waitForLoadingAnimationToFinish(windowB, 'loading-animation');
  // Waiting for image to change from loading state to loaded (takes a second)
  await sleepFor(1000);

  await replyTo(windowB, testMessage, testReply, windowA);
});

sessionTestTwoWindows('Send video 1:1', async ([windowA, windowB]) => {
  const [userA, userB] = await Promise.all([
    newUser(windowA, 'Alice'),
    newUser(windowB, 'Bob'),
  ]);
  const testMessage = `${userA.userName} sending video to ${userB.userName}`;
  const testReply = `${userB.userName} replying to video from ${userA.userName}`;
  await createContact(windowA, windowB, userA, userB);

  await windowA.setInputFiles(
    "input[type='file']",
    'tests/automation/fixtures/test-video.mp4',
  );
  await typeIntoInput(windowA, 'message-input-text-area', testMessage);
  await sleepFor(100);
  await clickOnElement({
    window: windowA,
    strategy: 'data-testid',
    selector: 'send-message-button',
  });
  await sleepFor(1000);
  await clickOnMatchingText(windowB, 'Click to download media');
  await clickOnTestIdWithText(windowB, 'session-confirm-ok-button');
  await waitForLoadingAnimationToFinish(windowB, 'loading-animation');
  // Waiting for videoto change from loading state to loaded (takes a second)
  await sleepFor(1000);
  await replyTo(windowB, testMessage, testReply, windowA);
});

sessionTestTwoWindows('Send document 1:1', async ([windowA, windowB]) => {
  const [userA, userB] = await Promise.all([
    newUser(windowA, 'Alice'),
    newUser(windowB, 'Bob'),
  ]);
  const testMessage = `${userA.userName} sending document to ${userB.userName}`;
  const testReply = `${userB.userName} replying to document from ${userA.userName}`;
  await createContact(windowA, windowB, userA, userB);
  await windowA.setInputFiles(
    "input[type='file']",
    'tests/automation/fixtures/test-file.pdf',
  );
  await typeIntoInput(windowA, 'message-input-text-area', testMessage);
  await sleepFor(100);
  await clickOnElement({
    window: windowA,
    strategy: 'data-testid',
    selector: 'send-message-button',
  });
  await sleepFor(1000);
  await clickOnMatchingText(windowB, 'Click to download media');
  await clickOnTestIdWithText(windowB, 'session-confirm-ok-button');
  await waitForLoadingAnimationToFinish(windowB, 'loading-animation');
  // Waiting for video to change from loading state to loaded (takes a second)
  await sleepFor(500);
  await replyTo(windowB, testMessage, testReply, windowA);
});

sessionTestTwoWindows('Send voice message 1:1', async ([windowA, windowB]) => {
  const [userA, userB] = await Promise.all([
    newUser(windowA, 'Alice'),
    newUser(windowB, 'Bob'),
  ]);
  // const testReply = `${userB.userName} to ${userA.userName}`;
  await createContact(windowA, windowB, userA, userB);

  await clickOnTestIdWithText(windowA, 'microphone-button');
  await clickOnTestIdWithText(windowA, 'session-toast');
  await clickOnTestIdWithText(windowA, 'enable-microphone');
  await clickOnTestIdWithText(windowA, 'message-section');
  await clickOnTestIdWithText(windowA, 'microphone-button');
  await sleepFor(5000);
  await clickOnTestIdWithText(windowA, 'end-voice-message');
  await sleepFor(4000);
  await clickOnElement({
    window: windowA,
    strategy: 'data-testid',
    selector: 'send-message-button',
  });
  await sleepFor(1000);
  await clickOnMatchingText(windowB, 'Click to download media');
  await clickOnTestIdWithText(windowB, 'session-confirm-ok-button');
});

sessionTestTwoWindows('Send GIF 1:1', async ([windowA, windowB]) => {
  const [userA, userB] = await Promise.all([
    newUser(windowA, 'Alice'),
    newUser(windowB, 'Bob'),
  ]);
  // const testReply = `${userB.userName} to ${userA.userName}`;
  await createContact(windowA, windowB, userA, userB);

  await windowA.setInputFiles(
    "input[type='file']",
    'tests/automation/fixtures/test-gif.gif',
  );
  await sleepFor(100);
  await clickOnElement({
    window: windowA,
    strategy: 'data-testid',
    selector: 'send-message-button',
  });
  await sleepFor(1000);
  await clickOnMatchingText(windowB, 'Click to download media');
});

sessionTestTwoWindows('Send long text 1:1', async ([windowA, windowB]) => {
  const [userA, userB] = await Promise.all([
    newUser(windowA, 'Alice'),
    newUser(windowB, 'Bob'),
  ]);

  const testReply = `${userB.userName} replying to long text message from ${userA.userName}`;
  const longText =
    // eslint-disable-next-line max-len
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum quis lacinia mi. Praesent fermentum vehicula rhoncus. Aliquam ac purus lobortis, convallis nisi quis, pulvinar elit. Nam commodo eros in molestie lobortis. Donec at mattis est. In tempor ex nec velit mattis, vitae feugiat augue maximus. Nullam risus libero, bibendum et enim et, viverra viverra est. Suspendisse potenti. Sed ut nibh in sem rhoncus suscipit. Etiam tristique leo sit amet ullamcorper dictum. Suspendisse sollicitudin, lectus et suscipit eleifend, libero dui ultricies neque, non elementum nulla orci bibendum lorem. Suspendisse potenti. Aenean a tellus imperdiet, iaculis metus quis, pretium diam. Nunc varius vitae enim vestibulum interdum. In hac habitasse platea dictumst. Donec auctor sem quis eleifend fermentum. Vestibulum neque nulla, maximus non arcu gravida, condimentum euismod turpis. Cras ac mattis orci. Quisque ac enim pharetra felis sodales eleifend. Aliquam erat volutpat. Donec sit amet mollis nibh, eget feugiat ipsum. Integer vestibulum purus ac suscipit egestas. Duis vitae aliquet ligula.';

  await createContact(windowA, windowB, userA, userB);

  await typeIntoInput(windowA, 'message-input-text-area', longText);
  await sleepFor(100);
  await clickOnElement({
    window: windowA,
    strategy: 'data-testid',
    selector: 'send-message-button',
  });
  await sleepFor(1000);
  await replyTo(windowB, longText, testReply, windowA);
});

sessionTestTwoWindows('Unsend message 1:1', async ([windowA, windowB]) => {
  const [userA, userB] = await Promise.all([
    newUser(windowA, 'Alice'),
    newUser(windowB, 'Bob'),
  ]);
  const unsendMessage = 'Testing unsend functionality';
  await createContact(windowA, windowB, userA, userB);

  await sendMessage(windowA, unsendMessage);
  await waitForTextMessage(windowB, unsendMessage);
  await clickOnTextMessage(windowA, unsendMessage, true);
  await clickOnMatchingText(windowA, 'Delete');
  await clickOnMatchingText(windowA, 'Delete for everyone');
  await clickOnElement({
    window: windowA,
    strategy: 'data-testid',
    selector: 'session-confirm-ok-button',
  });
  await waitForTestIdWithText(windowA, 'session-toast', 'Deleted');
  await sleepFor(1000);
  await waitForMatchingText(windowB, 'This message has been deleted');
});

sessionTestTwoWindows('Delete message 1:1', async ([windowA, windowB]) => {
  const [userA, userB] = await Promise.all([
    newUser(windowA, 'Alice'),
    newUser(windowB, 'Bob'),
  ]);
  const deletedMessage = 'Testing deletion functionality';
  await createContact(windowA, windowB, userA, userB);
  await sendMessage(windowA, deletedMessage);
  await waitForTextMessage(windowB, deletedMessage);
  await clickOnTextMessage(windowA, deletedMessage, true);
  await clickOnMatchingText(windowA, 'Delete');
  await clickOnElement({
    window: windowA,
    strategy: 'data-testid',
    selector: 'session-confirm-ok-button',
  });
  await waitForTestIdWithText(windowA, 'session-toast', 'Deleted');
  await hasTextMessageBeenDeleted(windowA, deletedMessage, 1000);
  // Still should exist in window B
  await waitForMatchingText(windowB, deletedMessage);
});

sessionTestTwoWindows('Check performance', async ([windowA, windowB]) => {
  const [userA, userB] = await Promise.all([
    newUser(windowA, 'Alice'),
    newUser(windowB, 'Bob'),
  ]);
  // Create contact
  await createContact(windowA, windowB, userA, userB);
  const timesArray: Array<number> = [];

  let i;
  for (i = 1; i <= 10; i++) {
    // eslint-disable-next-line no-await-in-loop
    const timeMs = await measureSendingTime(windowA, i);
    timesArray.push(timeMs);
  }
  console.log(timesArray);
});

// *************** NEED TO WAIT FOR LINK PREVIEW FIX *************************************************
sessionTestTwoWindows('Send link 1:1', async ([windowA, windowB]) => {
  const [userA, userB] = await Promise.all([
    newUser(windowA, 'Alice'),
    newUser(windowB, 'Bob'),
  ]);
  const testMessage = 'https://example.net';
  const testReply = `${userB.userName} replying to link from ${userA.userName}`;

  await createContact(windowA, windowB, userA, userB);

  await typeIntoInput(windowA, 'message-input-text-area', testMessage);
  await sleepFor(5000);
  await clickOnElement({
    window: windowA,
    strategy: 'data-testid',
    selector: 'send-message-button',
  });
  await sleepFor(1000);
  await replyTo(windowB, testMessage, testReply, windowA);
});
