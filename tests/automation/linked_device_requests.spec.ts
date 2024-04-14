import { sleepFor } from '../promise_utils';
import { sessionTestThreeWindowsWithTwoLinked } from './setup/sessionTest';
import { sendMessage } from './utilities/message';
import { sendNewMessage } from './utilities/send_message';
import {
  clickOnTestIdWithText,
  waitForMatchingText,
  waitForTestIdWithText,
  waitForTextMessage,
} from './utilities/utils';

sessionTestThreeWindowsWithTwoLinked(
  'Accept request syncs',
  async ({ alice, alice1, alice2, bob, bob1 }) => {
    const testMessage = `${bob.userName} sending message request to ${alice.userName}`;
    const testReply = `${alice.userName} accepting message request from ${bob.userName}`;
    await sendNewMessage(bob1, alice.sessionid, testMessage);
    // Accept request in alice1
    await clickOnTestIdWithText(alice1, 'message-request-banner');
    await clickOnTestIdWithText(alice2, 'message-request-banner');
    await clickOnTestIdWithText(
      alice1,
      'module-conversation__user__profile-name',
      bob.userName,
    );
    await clickOnTestIdWithText(alice1, 'accept-message-request');
    await waitForTestIdWithText(
      alice1,
      'message-request-response-message',
      `You have accepted ${bob.userName}'s message request`,
    );
    await waitForMatchingText(alice1, 'No pending message requests');
    await waitForMatchingText(alice2, 'No pending message requests');
    await sendMessage(alice1, testReply);
    await waitForTextMessage(bob1, testReply);
    await clickOnTestIdWithText(alice2, 'new-conversation-button');
    await waitForTestIdWithText(
      alice2,
      'module-conversation__user__profile-name',
      bob.userName,
    );
  },
);

sessionTestThreeWindowsWithTwoLinked(
  'Decline request syncs',
  async ({ alice, alice1, alice2, bob, bob1 }) => {
    const testMessage = `${bob.userName} sending message request to ${alice.userName}`;
    await sendNewMessage(bob1, alice.sessionid, testMessage);
    // Decline request in alice1
    await clickOnTestIdWithText(alice1, 'message-request-banner');
    await clickOnTestIdWithText(
      alice1,
      'module-conversation__user__profile-name',
      bob.userName,
    );
    await clickOnTestIdWithText(alice2, 'message-request-banner');
    await waitForTestIdWithText(
      alice2,
      'module-conversation__user__profile-name',
      bob.userName,
    );
    await sleepFor(1000);
    await clickOnTestIdWithText(alice1, 'decline-message-request', 'Decline');
    await clickOnTestIdWithText(alice1, 'session-confirm-ok-button', 'Decline');

    // Note: this test is broken currently but this is a known issue.
    // It happens because we have a race condition between the update from libsession and the update from the swarm, both with the same seqno.
    // See SES-1563
    console.warn(
      'This test is subject to a race condition and so is most of the times, broken. See SES-1563',
    );

    await waitForMatchingText(alice1, 'No pending message requests');
    await waitForMatchingText(alice2, 'No pending message requests');
  },
);
