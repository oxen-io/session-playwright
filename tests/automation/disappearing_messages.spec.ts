import { localize } from '../locale/localizedString';
import { sleepFor } from '../promise_utils';
import {
  test_Alice_2W,
  test_Alice_2W_Bob_1W,
  test_group_Alice_2W_Bob_1W_Charlie_1W,
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

test_Alice_2W_Bob_1W(
  'Disappear after read 1:1',
  async ({ alice, bob, aliceWindow1, aliceWindow2, bobWindow1 }) => {
    const testMessage =
      'Testing disappearing messages timer is working correctly';

    const controlMessage = localize('disappearingMessagesSetYou')
      .strip()
      .withArgs({ time: '10 seconds', disappearing_messages_type: 'read' })
      .toString();
    // Create Contact
    await createContact(aliceWindow1, bobWindow1, alice, bob);
    // Click on conversation in linked device
    await clickOnTestIdWithText(
      aliceWindow2,
      'module-conversation__user__profile-name',
      bob.userName,
    );

    await setDisappearingMessages(
      aliceWindow1,
      ['1:1', 'disappear-after-read-option', 'time-option-10-seconds'],
      bobWindow1,
    );

    // Check control message is visible
    await doesTextIncludeString(
      aliceWindow1,
      'disappear-control-message',
      controlMessage,
    );
    await sleepFor(10000);
    // Control message should also disappear after 10 seconds
    await hasTextMessageBeenDeleted(aliceWindow1, controlMessage);
    // Send message
    await sendMessage(aliceWindow1, testMessage);
    // Check window B for message to confirm arrival
    // await clickOnTextMessage(bobWindow1, testMessage);
    await waitForTextMessage(bobWindow1, testMessage);
    // Wait 10 seconds to see if message is removed
    await sleepFor(10000);
    await hasTextMessageBeenDeleted(aliceWindow1, testMessage);
    // Check window B (need to refocus window)
    console.log(`Bring window B to front`);
    const message = 'Forcing window to front';
    await typeIntoInput(bobWindow1, 'message-input-text-area', message);
    // click up arrow (send)
    await clickOnElement({
      window: bobWindow1,
      strategy: 'data-testid',
      selector: 'send-message-button',
    });
    await sleepFor(10000);
    await hasTextMessageBeenDeleted(bobWindow1, testMessage);
  },
);

test_Alice_2W_Bob_1W(
  'Disappear after send 1:1',
  async ({ alice, bob, aliceWindow1, aliceWindow2, bobWindow1 }) => {
    const testMessage =
      'Testing disappearing messages timer is working correctly';
    const controlMessage = localize('disappearingMessagesSetYou')
      .strip()
      .withArgs({ time: '10 seconds', disappearing_messages_type: 'sent' })
      .toString();
    // Create Contact
    await createContact(aliceWindow1, bobWindow1, alice, bob);

    // Click on conversation in linked device
    await clickOnTestIdWithText(
      aliceWindow2,
      'module-conversation__user__profile-name',
      bob.userName,
    );
    await setDisappearingMessages(
      aliceWindow1,
      ['1:1', 'disappear-after-send-option', 'time-option-10-seconds'],
      bobWindow1,
    );
    // Check control message is correct and appearing
    await doesTextIncludeString(
      aliceWindow1,
      'disappear-control-message',
      controlMessage,
    );
    await sendMessage(aliceWindow1, testMessage);
    // Check message has appeared in receivers window and linked device
    await Promise.all([
      waitForTextMessage(bobWindow1, testMessage),
      waitForTextMessage(aliceWindow2, testMessage),
    ]);
    // Wait 10 seconds for message to disappearing (should disappear on all devices at once)
    await sleepFor(10000);
    await Promise.all([
      hasTextMessageBeenDeleted(aliceWindow1, testMessage),
      hasTextMessageBeenDeleted(bobWindow1, testMessage),
      hasTextMessageBeenDeleted(aliceWindow2, testMessage),
    ]);
  },
);

test_group_Alice_2W_Bob_1W_Charlie_1W(
  'Disappear after send groups',
  async ({
    aliceWindow1,
    aliceWindow2,
    bobWindow1,
    charlieWindow1,
    groupCreated,
  }) => {
    const controlMessageText =
      'set messages to disappear 10 seconds after they have been sent';
    const testMessage = 'Testing disappearing messages in groups';

    await clickOnTestIdWithText(
      aliceWindow2,
      'module-conversation__user__profile-name',
      groupCreated.userName,
    );
    await setDisappearingMessages(aliceWindow1, [
      'group',
      'disappear-after-send-option',
      'time-option-10-seconds',
    ]);
    // Check control message is visible and correct
    await doesTextIncludeString(
      aliceWindow1,
      'disappear-control-message',
      controlMessageText,
    );
    await sendMessage(aliceWindow1, testMessage);
    await Promise.all([
      waitForTextMessage(bobWindow1, testMessage),
      waitForTextMessage(charlieWindow1, testMessage),
      waitForTextMessage(aliceWindow2, testMessage),
    ]);
    // Wait 10 seconds for messages to disappear
    await sleepFor(10000);
    await Promise.all([
      hasTextMessageBeenDeleted(aliceWindow1, testMessage),
      hasTextMessageBeenDeleted(bobWindow1, testMessage),
      hasTextMessageBeenDeleted(charlieWindow1, testMessage),
      hasTextMessageBeenDeleted(aliceWindow2, testMessage),
    ]);
  },
);

test_Alice_2W(
  'Disappear after send note to self',
  async ({ alice, aliceWindow1, aliceWindow2 }) => {
    const testMessage = 'Message to test note to self';
    const testMessageDisappear = 'Message testing disappearing messages';
    const controlMessageText =
      'set messages to disappear 10 seconds after they have been sent';
    // Open Note to self conversation
    await sendNewMessage(aliceWindow1, alice.accountid, testMessage);
    // Check messages are syncing across linked devices
    await clickOnTestIdWithText(
      aliceWindow2,
      'module-conversation__user__profile-name',
      'Note to Self',
    );
    await waitForTextMessage(aliceWindow2, testMessage);
    // Enable disappearing messages
    await setDisappearingMessages(aliceWindow1, [
      'note-to-self',
      'disappear-after-send-option',
      'input-10-seconds',
    ]);
    // Check control message is visible and correct
    await doesTextIncludeString(
      aliceWindow1,
      'disappear-control-message',
      controlMessageText,
    );
    await sendMessage(aliceWindow1, testMessageDisappear);
    await waitForTextMessage(aliceWindow2, testMessageDisappear);
    await Promise.all([
      hasTextMessageBeenDeleted(aliceWindow1, testMessageDisappear),
      hasTextMessageBeenDeleted(aliceWindow2, testMessageDisappear),
    ]);
  },
);
