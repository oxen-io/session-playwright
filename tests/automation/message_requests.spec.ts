import { test_Alice_1W_Bob_1W } from './setup/sessionTest';
import { sendMessage } from './utilities/message';
import { sendNewMessage } from './utilities/send_message';
import {
  clickOnMatchingText,
  clickOnTestIdWithText,
  waitForMatchingText,
  waitForTestIdWithText,
} from './utilities/utils';

// Open two windows and log into 2 separate accounts
test_Alice_1W_Bob_1W(
  'Message requests accept',
  async ({ alice, alice1, bob, bob1 }) => {
    const testMessage = `Sender: ${alice.userName} Receiver: ${bob.userName}`;
    // send a message to User B from User A
    await sendNewMessage(alice1, bob.sessionid, `${testMessage}`);
    // Check the message request banner appears and click on it
    await clickOnTestIdWithText(bob1, 'message-request-banner');
    // Select message request from User A
    await clickOnTestIdWithText(
      bob1,
      'module-conversation__user__profile-name',
      alice.userName,
    );
    // Check that using the accept button has intended use
    await clickOnTestIdWithText(bob1, 'accept-message-request');
    // Check config message of message request acceptance
    await waitForTestIdWithText(
      bob1,
      'message-request-response-message',
      `You have accepted ${alice.userName}'s message request`,
    );
    await waitForMatchingText(bob1, 'No pending message requests');
  },
);

test_Alice_1W_Bob_1W(
  'Message requests text reply',
  async ({ alice, alice1, bob, bob1 }) => {
    const testMessage = `Sender: ${alice.userName}, Receiver: ${bob.userName}`;
    const testReply = `Sender: ${bob.userName}, Receiver: ${alice.userName}`;
    // send a message to User B from User A
    await sendNewMessage(alice1, bob.sessionid, `${testMessage}`);
    // Check the message request banner appears and click on it
    await clickOnTestIdWithText(bob1, 'message-request-banner');
    // Select message request from User A
    await clickOnTestIdWithText(
      bob1,
      'module-conversation__user__profile-name',
      alice.userName,
    );
    await sendMessage(bob1, testReply);
    // Check config message of message request acceptance

    await waitForTestIdWithText(
      bob1,
      'message-request-response-message',
      `You have accepted ${alice.userName}'s message request`,
    );
    await waitForMatchingText(bob1, 'No pending message requests');
  },
);

test_Alice_1W_Bob_1W(
  'Message requests decline',
  async ({ alice, alice1, bob, bob1 }) => {
    const testMessage = `Sender: ${alice.userName}, Receiver: ${bob.userName}`;
    // send a message to User B from User A
    await sendNewMessage(alice1, bob.sessionid, `${testMessage}`);
    // Check the message request banner appears and click on it
    await clickOnTestIdWithText(bob1, 'message-request-banner');
    // Select message request from User A
    await clickOnTestIdWithText(
      bob1,
      'module-conversation__user__profile-name',
      alice.userName,
    );
    // Check that using the accept button has intended use
    await clickOnTestIdWithText(bob1, 'decline-message-request');
    // Confirm decline
    await clickOnTestIdWithText(bob1, 'session-confirm-ok-button', 'Decline');
    // Check config message of message request acceptance
    await waitForMatchingText(bob1, 'No pending message requests');
  },
);

test_Alice_1W_Bob_1W(
  'Message requests clear all',
  async ({ alice, alice1, bob, bob1 }) => {
    const testMessage = `Sender: ${alice.userName}, Receiver: ${bob.userName}`;
    // send a message to User B from User A
    await sendNewMessage(alice1, bob.sessionid, `${testMessage}`);
    // Check the message request banner appears and click on it
    await clickOnTestIdWithText(bob1, 'message-request-banner');
    // Select 'Clear All' button
    await clickOnMatchingText(bob1, 'Clear All');
    // Confirm decline
    await clickOnTestIdWithText(bob1, 'session-confirm-ok-button', 'OK');
    // Navigate back to message request folder to check
    await clickOnTestIdWithText(bob1, 'settings-section');

    await clickOnTestIdWithText(
      bob1,
      'message-requests-settings-menu-item',
      'Message Requests',
    );
    // Check config message of message request acceptance
    await waitForMatchingText(bob1, 'No pending message requests');
  },
);

// Clear all requests

// Delete request (not a feature yet)
// Block request (not a feature yet)
