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
  ['Alice', 'Bob'],
  async (
    { windowsLinked: [windowA, windowB], otherWindow },
    { userLinked, otherUser },
  ) => {
    const testMessage = `${otherUser.userName} sending message request to ${userLinked.userName}`;
    const testReply = `${userLinked.userName} accepting message request from ${otherUser.userName}`;
    await sendNewMessage(otherWindow, userLinked.sessionid, testMessage);
    // Accept request in windowA
    await clickOnTestIdWithText(windowA, 'message-request-banner');
    await clickOnTestIdWithText(windowB, 'message-request-banner');
    await clickOnTestIdWithText(
      windowA,
      'module-conversation__user__profile-name',
      otherUser.userName,
    );
    await clickOnTestIdWithText(windowA, 'accept-message-request');
    await waitForTestIdWithText(
      windowA,
      'message-request-response-message',
      `You have accepted ${otherUser.userName}'s message request`,
    );
    await waitForMatchingText(windowA, 'No pending message requests');
    await waitForMatchingText(windowB, 'No pending message requests');
    await sendMessage(windowA, testReply);
    await waitForTextMessage(otherWindow, testReply);
    await clickOnTestIdWithText(windowB, 'new-conversation-button');
    await waitForTestIdWithText(
      windowB,
      'module-conversation__user__profile-name',
      otherUser.userName,
    );
  },
);

sessionTestThreeWindowsWithTwoLinked(
  'Decline request syncs',
  ['Alice', 'Bob'],
  async (
    { windowsLinked: [windowA, windowB], otherWindow },
    { userLinked, otherUser },
  ) => {
    const testMessage = `${otherUser.userName} sending message request to ${userLinked.userName}`;
    await sendNewMessage(otherWindow, userLinked.sessionid, testMessage);
    // Decline request in windowA
    await clickOnTestIdWithText(windowA, 'message-request-banner');
    await clickOnTestIdWithText(
      windowA,
      'module-conversation__user__profile-name',
      otherUser.userName,
    );
    await clickOnTestIdWithText(windowB, 'message-request-banner');
    await waitForTestIdWithText(
      windowB,
      'module-conversation__user__profile-name',
      otherUser.userName,
    );
    await sleepFor(1000);
    await clickOnTestIdWithText(windowA, 'decline-message-request', 'Decline');
    await clickOnTestIdWithText(
      windowA,
      'session-confirm-ok-button',
      'Decline',
    );

    // Note: this test is broken currently but this is a known issue.
    // It happens because we have a race condition between the update from libsession and the update from the swarm, both with the same seqno.
    // See SES-1563
    console.warn(
      'This test is subject to a race condition and so is most of the times, broken. See SES-1563',
    );

    await waitForMatchingText(windowA, 'No pending message requests');
    await waitForMatchingText(windowB, 'No pending message requests');
  },
);
