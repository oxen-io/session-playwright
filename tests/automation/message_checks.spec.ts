import { sleepFor } from '../promise_utils';
import { newUser } from './setup/new_user';
import { sessionTestTwoWindows, test_Alice1_Bob1 } from './setup/sessionTest';
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

test_Alice1_Bob1('Send image 1:1', async ({ alice, alice1, bob, bob1 }) => {
  const testMessage = `${alice.userName} sending image to ${bob.userName}`;
  const testReply = `${bob.userName} replying to image from ${alice.userName}`;
  await createContact(alice1, bob1, alice, bob);

  await alice1.setInputFiles(
    "input[type='file']",
    'tests/automation/fixtures/test-image.png',
  );
  await typeIntoInput(alice1, 'message-input-text-area', testMessage);
  await clickOnElement({
    window: alice1,
    strategy: 'data-testid',
    selector: 'send-message-button',
  });
  // Click on untrusted attachment in window B
  await sleepFor(1000);
  await clickOnMatchingText(bob1, 'Click to download media');
  await clickOnTestIdWithText(bob1, 'session-confirm-ok-button');
  await waitForLoadingAnimationToFinish(bob1, 'loading-animation');
  // Waiting for image to change from loading state to loaded (takes a second)
  await sleepFor(1000);

  await replyTo({
    windowSender: bob1,
    textMessage: testMessage,
    replyText: testReply,
    windowReceiver: alice1,
  });
});

test_Alice1_Bob1('Send video 1:1', async ({ alice, alice1, bob, bob1 }) => {
  const testMessage = `${alice.userName} sending video to ${bob.userName}`;
  const testReply = `${bob.userName} replying to video from ${alice.userName}`;
  await createContact(alice1, bob1, alice, bob);

  await alice1.setInputFiles(
    "input[type='file']",
    'tests/automation/fixtures/test-video.mp4',
  );
  await typeIntoInput(alice1, 'message-input-text-area', testMessage);
  // give some time before we send the message, as the video preview takes some time to be added
  await sleepFor(1000);

  await clickOnElement({
    window: alice1,
    strategy: 'data-testid',
    selector: 'send-message-button',
  });
  await clickOnMatchingText(bob1, 'Click to download media');
  await clickOnTestIdWithText(bob1, 'session-confirm-ok-button');
  await waitForLoadingAnimationToFinish(bob1, 'loading-animation');
  // Waiting for videoto change from loading state to loaded (takes a second)
  await sleepFor(1000);
  await replyTo({
    windowSender: bob1,
    textMessage: testMessage,
    replyText: testReply,
    windowReceiver: alice1,
  });
});

test_Alice1_Bob1('Send document 1:1', async ({ alice, alice1, bob, bob1 }) => {
  const testMessage = `${alice.userName} sending document to ${bob.userName}`;
  const testReply = `${bob.userName} replying to document from ${alice.userName}`;
  await createContact(alice1, bob1, alice, bob);
  await alice1.setInputFiles(
    "input[type='file']",
    'tests/automation/fixtures/test-file.pdf',
  );
  await typeIntoInput(alice1, 'message-input-text-area', testMessage);
  await sleepFor(100);
  await clickOnElement({
    window: alice1,
    strategy: 'data-testid',
    selector: 'send-message-button',
  });
  await sleepFor(1000);
  await clickOnMatchingText(bob1, 'Click to download media');
  await clickOnTestIdWithText(bob1, 'session-confirm-ok-button');
  await waitForLoadingAnimationToFinish(bob1, 'loading-animation');
  // Waiting for video to change from loading state to loaded (takes a second)
  await sleepFor(500);
  await replyTo({
    windowSender: bob1,
    textMessage: testMessage,
    replyText: testReply,
    windowReceiver: alice1,
  });
});

test_Alice1_Bob1(
  'Send voice message 1:1',
  async ({ alice, alice1, bob, bob1 }) => {
    // const testReply = `${bob.userName} to ${alice.userName}`;
    await createContact(alice1, bob1, alice, bob);

    await clickOnTestIdWithText(alice1, 'microphone-button');
    await clickOnTestIdWithText(alice1, 'session-toast');
    await clickOnTestIdWithText(alice1, 'enable-microphone');
    await clickOnTestIdWithText(alice1, 'message-section');
    await clickOnTestIdWithText(alice1, 'microphone-button');
    await sleepFor(5000);
    await clickOnTestIdWithText(alice1, 'end-voice-message');
    await sleepFor(4000);
    await clickOnElement({
      window: alice1,
      strategy: 'data-testid',
      selector: 'send-message-button',
    });
    await sleepFor(1000);
    await clickOnMatchingText(bob1, 'Click to download media');
    await clickOnTestIdWithText(bob1, 'session-confirm-ok-button');
  },
);

test_Alice1_Bob1('Send GIF 1:1', async ({ alice, alice1, bob, bob1 }) => {
  // const testReply = `${bob.userName} to ${alice.userName}`;
  await createContact(alice1, bob1, alice, bob);

  await alice1.setInputFiles(
    "input[type='file']",
    'tests/automation/fixtures/test-gif.gif',
  );
  await sleepFor(100);
  await clickOnElement({
    window: alice1,
    strategy: 'data-testid',
    selector: 'send-message-button',
  });
  await sleepFor(1000);
  await clickOnMatchingText(bob1, 'Click to download media');
});

test_Alice1_Bob1('Send long text 1:1', async ({ alice, alice1, bob, bob1 }) => {
  const testReply = `${bob.userName} replying to long text message from ${alice.userName}`;
  const longText =
    // eslint-disable-next-line max-len
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum quis lacinia mi. Praesent fermentum vehicula rhoncus. Aliquam ac purus lobortis, convallis nisi quis, pulvinar elit. Nam commodo eros in molestie lobortis. Donec at mattis est. In tempor ex nec velit mattis, vitae feugiat augue maximus. Nullam risus libero, bibendum et enim et, viverra viverra est. Suspendisse potenti. Sed ut nibh in sem rhoncus suscipit. Etiam tristique leo sit amet ullamcorper dictum. Suspendisse sollicitudin, lectus et suscipit eleifend, libero dui ultricies neque, non elementum nulla orci bibendum lorem. Suspendisse potenti. Aenean a tellus imperdiet, iaculis metus quis, pretium diam. Nunc varius vitae enim vestibulum interdum. In hac habitasse platea dictumst. Donec auctor sem quis eleifend fermentum. Vestibulum neque nulla, maximus non arcu gravida, condimentum euismod turpis. Cras ac mattis orci. Quisque ac enim pharetra felis sodales eleifend. Aliquam erat volutpat. Donec sit amet mollis nibh, eget feugiat ipsum. Integer vestibulum purus ac suscipit egestas. Duis vitae aliquet ligula.';

  await createContact(alice1, bob1, alice, bob);

  await typeIntoInput(alice1, 'message-input-text-area', longText);
  await sleepFor(100);
  await clickOnElement({
    window: alice1,
    strategy: 'data-testid',
    selector: 'send-message-button',
  });
  await sleepFor(1000);
  await replyTo({
    windowSender: bob1,
    textMessage: longText,
    replyText: testReply,
    windowReceiver: alice1,
  });
});

test_Alice1_Bob1('Unsend message 1:1', async ({ alice, alice1, bob, bob1 }) => {
  const unsendMessage = 'Testing unsend functionality';
  await createContact(alice1, bob1, alice, bob);

  await sendMessage(alice1, unsendMessage);
  await waitForTextMessage(bob1, unsendMessage);
  await clickOnTextMessage(alice1, unsendMessage, true);
  await clickOnMatchingText(alice1, 'Delete');
  await clickOnMatchingText(alice1, 'Delete for everyone');
  await clickOnElement({
    window: alice1,
    strategy: 'data-testid',
    selector: 'session-confirm-ok-button',
  });
  await waitForTestIdWithText(alice1, 'session-toast', 'Deleted');
  await sleepFor(1000);
  await waitForMatchingText(bob1, 'This message has been deleted');
});

test_Alice1_Bob1('Delete message 1:1', async ({ alice, alice1, bob, bob1 }) => {
  const deletedMessage = 'Testing deletion functionality';
  await createContact(alice1, bob1, alice, bob);
  await sendMessage(alice1, deletedMessage);
  await waitForTextMessage(bob1, deletedMessage);
  await clickOnTextMessage(alice1, deletedMessage, true);
  await clickOnMatchingText(alice1, 'Delete');
  await clickOnElement({
    window: alice1,
    strategy: 'data-testid',
    selector: 'session-confirm-ok-button',
  });
  await waitForTestIdWithText(alice1, 'session-toast', 'Deleted');
  await hasTextMessageBeenDeleted(alice1, deletedMessage, 1000);
  // Still should exist in window B
  await waitForMatchingText(bob1, deletedMessage);
});

sessionTestTwoWindows('Check performance', async ([alice1, bob1]) => {
  const [alice, bob] = await Promise.all([
    newUser(alice1, 'Alice'),
    newUser(bob1, 'Bob'),
  ]);
  // Create contact
  await createContact(alice1, bob1, alice, bob);
  const timesArray: Array<number> = [];

  let i;
  for (i = 1; i <= 10; i++) {
    // eslint-disable-next-line no-await-in-loop
    const timeMs = await measureSendingTime(alice1, i);
    timesArray.push(timeMs);
  }
  console.log(timesArray);
});

// *************** NEED TO WAIT FOR LINK PREVIEW FIX *************************************************

test_Alice1_Bob1('Send link 1:1', async ({ alice, alice1, bob, bob1 }) => {
  const testMessage = 'https://example.net';
  const testReply = `${bob.userName} replying to link from ${alice.userName}`;

  await createContact(alice1, bob1, alice, bob);

  await typeIntoInput(alice1, 'message-input-text-area', testMessage);
  await sleepFor(5000);
  await clickOnElement({
    window: alice1,
    strategy: 'data-testid',
    selector: 'send-message-button',
  });
  await sleepFor(1000);
  await replyTo({
    windowSender: bob1,
    textMessage: testMessage,
    replyText: testReply,
    windowReceiver: alice1,
  });
});
