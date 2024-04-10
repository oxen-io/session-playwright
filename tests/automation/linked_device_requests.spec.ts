import { sleepFor } from '../promise_utils';
import { newUser } from './setup/new_user';
import { sessionTestTwoWindows } from './setup/sessionTest';
import { linkedDevice } from './utilities/linked_device';
import { sendMessage } from './utilities/message';
import { sendNewMessage } from './utilities/send_message';
import {
  clickOnTestIdWithText,
  waitForMatchingText,
  waitForTestIdWithText,
  waitForTextMessage,
} from './utilities/utils';

sessionTestTwoWindows('Accept request syncs', async ([windowA, windowB]) => {
  const [userA, userB] = await Promise.all([
    newUser(windowA, 'Alice'),
    newUser(windowB, 'Bob'),
  ]);
  const [windowC] = await linkedDevice(userB.recoveryPhrase);

  const testMessage = `${userA.userName} sending message request to ${userB.userName}`;
  const testReply = `${userB.userName} accepting message request from ${userA.userName}`;
  await sendNewMessage(windowA, userB.sessionid, testMessage);
  // Accept request in windowB
  await clickOnTestIdWithText(windowB, 'message-request-banner');
  await clickOnTestIdWithText(windowC, 'message-request-banner');
  await clickOnTestIdWithText(
    windowB,
    'module-conversation__user__profile-name',
    userA.userName,
  );
  await clickOnTestIdWithText(windowB, 'accept-message-request');
  await waitForTestIdWithText(
    windowB,
    'message-request-response-message',
    `You have accepted ${userA.userName}'s message request`,
  );
  await waitForMatchingText(windowB, 'No pending message requests');
  await waitForMatchingText(windowC, 'No pending message requests');
  await sendMessage(windowB, testReply);
  await waitForTextMessage(windowA, testReply);
  await clickOnTestIdWithText(windowC, 'new-conversation-button');
  await waitForTestIdWithText(
    windowC,
    'module-conversation__user__profile-name',
    userA.userName,
  );
});

sessionTestTwoWindows('Decline request syncs', async ([windowA, windowB]) => {
  const [userA, userB] = await Promise.all([
    newUser(windowA, 'Alice'),
    newUser(windowB, 'Bob'),
  ]);
  const [windowC] = await linkedDevice(userB.recoveryPhrase);

  const testMessage = `${userA.userName} sending message request to ${userB.userName}`;
  await sendNewMessage(windowA, userB.sessionid, testMessage);
  // Decline request in windowB
  await clickOnTestIdWithText(windowB, 'message-request-banner');
  await clickOnTestIdWithText(
    windowB,
    'module-conversation__user__profile-name',
    userA.userName,
  );
  await clickOnTestIdWithText(windowC, 'message-request-banner');
  await waitForTestIdWithText(
    windowC,
    'module-conversation__user__profile-name',
    userA.userName,
  );
  await sleepFor(1000);
  await clickOnTestIdWithText(windowB, 'decline-message-request', 'Decline');
  await clickOnTestIdWithText(windowB, 'session-confirm-ok-button', 'Decline');

  // Note: this test is broken currently but this is a known issue.
  // It happens because we have a race condition between the update from libsession and the update from the swarm, both with the same seqno.
  // See SES-1563
  console.warn(
    'This test is subject to a race condition and so is most of the times, broken. See SES-1563',
  );

  await waitForMatchingText(windowB, 'No pending message requests');
  await waitForMatchingText(windowC, 'No pending message requests');
});
