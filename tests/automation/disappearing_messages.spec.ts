import { sleepFor } from '../promise_utils';
import {
  test_Alice2,
  test_Alice2_Bob1,
  test_group_Alice2_Bob1_Charlie1,
} from './setup/sessionTest';
import { createContact } from './utilities/create_contact';
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

test_Alice2_Bob1(
  'Disappear after read 1:1',
  async ({ alice, bob, alice1, alice2, bob1 }) => {
    const testMessage =
      'Testing disappearing messages timer is working correctly';
    const controlMessage =
      'set your messages to disappear 10 seconds after they have been read';
    // Create Contact
    await createContact(alice1, bob1, alice, bob);
    // Click on conversation in linked device
    await clickOnTestIdWithText(
      alice2,
      'module-conversation__user__profile-name',
      bob.userName,
    );

    await setDisappearingMessages(
      alice1,
      ['1:1', 'disappear-after-read-option', 'time-option-10-seconds'],
      bob1,
    );
    // Check control message is visible
    await doesTextIncludeString(
      alice1,
      'disappear-control-message',
      controlMessage,
    );
    await sleepFor(10000);
    // Control message should also disappear after 10 seconds
    await hasTextMessageBeenDeleted(alice1, controlMessage);
    // Send message
    await sendMessage(alice1, testMessage);
    // Check window B for message to confirm arrival
    // await clickOnTextMessage(bob1, testMessage);
    await waitForTextMessage(bob1, testMessage);
    // Wait 10 seconds to see if message is removed
    await sleepFor(10000);
    await hasTextMessageBeenDeleted(alice1, testMessage);
    // Check window B (need to refocus window)
    console.log(`Bring window B to front`);
    const message = 'Forcing window to front';
    await typeIntoInput(bob1, 'message-input-text-area', message);
    // click up arrow (send)
    await clickOnElement({
      window: bob1,
      strategy: 'data-testid',
      selector: 'send-message-button',
    });
    await sleepFor(10000);
    await hasTextMessageBeenDeleted(bob1, testMessage);
  },
);

test_Alice2_Bob1(
  'Disappear after send 1:1',
  async ({ alice, bob, alice1, alice2, bob1 }) => {
    const testMessage =
      'Testing disappearing messages timer is working correctly';
    const controlMessage =
      'set your messages to disappear 10 seconds after they have been sent';
    // Create Contact
    await createContact(alice1, bob1, alice, bob);

    // Click on conversation in linked device
    await clickOnTestIdWithText(
      alice2,
      'module-conversation__user__profile-name',
      bob.userName,
    );
    await setDisappearingMessages(
      alice1,
      ['1:1', 'disappear-after-send-option', 'time-option-10-seconds'],
      bob1,
    );
    // Check control message is correct and appearing
    await doesTextIncludeString(
      alice1,
      'disappear-control-message',
      controlMessage,
    );
    await sendMessage(alice1, testMessage);
    // Check message has appeared in receivers window and linked device
    await Promise.all([
      waitForTextMessage(bob1, testMessage),
      waitForTextMessage(alice2, testMessage),
    ]);
    // Wait 10 seconds for message to disappearing (should disappear on all devices at once)
    await sleepFor(10000);
    await Promise.all([
      hasTextMessageBeenDeleted(alice1, testMessage),
      hasTextMessageBeenDeleted(bob1, testMessage),
      hasTextMessageBeenDeleted(alice2, testMessage),
    ]);
  },
);

test_group_Alice2_Bob1_Charlie1(
  'Disappear after send groups',
  async ({ alice1, alice2, bob1, charlie1, groupCreated }) => {
    const controlMessageText =
      'set messages to disappear 10 seconds after they have been sent';
    const testMessage = 'Testing disappearing messages in groups';

    await clickOnTestIdWithText(
      alice2,
      'module-conversation__user__profile-name',
      groupCreated.userName,
    );
    await setDisappearingMessages(alice1, [
      'group',
      'disappear-after-send-option',
      'time-option-10-seconds',
    ]);
    // Check control message is visible and correct
    await doesTextIncludeString(
      alice1,
      'disappear-control-message',
      controlMessageText,
    );
    await sendMessage(alice1, testMessage);
    await Promise.all([
      waitForTextMessage(bob1, testMessage),
      waitForTextMessage(charlie1, testMessage),
      waitForTextMessage(alice2, testMessage),
    ]);
    // Wait 10 seconds for messages to disappear
    await sleepFor(10000);
    await Promise.all([
      hasTextMessageBeenDeleted(alice1, testMessage),
      hasTextMessageBeenDeleted(bob1, testMessage),
      hasTextMessageBeenDeleted(charlie1, testMessage),
      hasTextMessageBeenDeleted(alice2, testMessage),
    ]);
  },
);

test_Alice2(
  'Disappear after send note to self',
  async ({ alice, alice1, alice2 }) => {
    const testMessage = 'Message to test note to self';
    const testMessageDisappear = 'Message testing disappearing messages';
    const controlMessageText =
      'set messages to disappear 10 seconds after they have been sent';
    // Open Note to self conversation
    await sendNewMessage(alice1, alice.sessionid, testMessage);
    // Check messages are syncing across linked devices
    await clickOnTestIdWithText(
      alice2,
      'module-conversation__user__profile-name',
      'Note to Self',
    );
    await waitForTextMessage(alice2, testMessage);
    // Enable disappearing messages
    await setDisappearingMessages(alice1, [
      'note-to-self',
      'disappear-after-send-option',
      'input-10-seconds',
    ]);
    // Check control message is visible and correct
    await doesTextIncludeString(
      alice1,
      'disappear-control-message',
      controlMessageText,
    );
    await sendMessage(alice1, testMessageDisappear);
    await waitForTextMessage(alice2, testMessageDisappear);
    await sleepFor(10000);
    await Promise.all([
      hasTextMessageBeenDeleted(alice1, testMessageDisappear),
      hasTextMessageBeenDeleted(alice2, testMessageDisappear),
    ]);
  },
);
