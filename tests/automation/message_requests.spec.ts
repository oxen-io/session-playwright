import { localize } from '../locale/localizedString';
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
  async ({ alice, aliceWindow1, bob, bobWindow1 }) => {
    const testMessage = `Sender: ${alice.userName} Receiver: ${bob.userName}`;
    // send a message to User B from User A
    await sendNewMessage(aliceWindow1, bob.accountid, `${testMessage}`);
    // Check the message request banner appears and click on it
    await clickOnTestIdWithText(bobWindow1, 'message-request-banner');
    // Select message request from User A
    await clickOnTestIdWithText(
      bobWindow1,
      'module-conversation__user__profile-name',
      alice.userName,
    );
    // Check that using the accept button has intended use
    await clickOnTestIdWithText(bobWindow1, 'accept-message-request');
    // Check config message of message request acceptance
    await waitForTestIdWithText(
      bobWindow1,
      'message-request-response-message',
      localize('messageRequestYouHaveAccepted')
        .strip()
        .withArgs({
          name: alice.userName,
        })
        .toString(),
    );
    await waitForMatchingText(
      bobWindow1,
      localize('messageRequestsNonePending').toString(),
    );
  },
);

test_Alice_1W_Bob_1W(
  'Message requests text reply',
  async ({ alice, aliceWindow1, bob, bobWindow1 }) => {
    const testMessage = `Sender: ${alice.userName}, Receiver: ${bob.userName}`;
    const testReply = `Sender: ${bob.userName}, Receiver: ${alice.userName}`;
    // send a message to User B from User A
    await sendNewMessage(aliceWindow1, bob.accountid, `${testMessage}`);
    // Check the message request banner appears and click on it
    await clickOnTestIdWithText(bobWindow1, 'message-request-banner');
    // Select message request from User A
    await clickOnTestIdWithText(
      bobWindow1,
      'module-conversation__user__profile-name',
      alice.userName,
    );
    await sendMessage(bobWindow1, testReply);
    // Check config message of message request acceptance

    await waitForTestIdWithText(
      bobWindow1,
      'message-request-response-message',
      localize('messageRequestYouHaveAccepted')
        .strip()
        .withArgs({
          name: alice.userName,
        })
        .toString(),
    );
    await waitForMatchingText(
      bobWindow1,
      localize('messageRequestsNonePending').toString(),
    );
  },
);

test_Alice_1W_Bob_1W(
  'Message requests decline',
  async ({ alice, aliceWindow1, bob, bobWindow1 }) => {
    const testMessage = `Sender: ${alice.userName}, Receiver: ${bob.userName}`;
    // send a message to User B from User A
    await sendNewMessage(aliceWindow1, bob.accountid, `${testMessage}`);
    // Check the message request banner appears and click on it
    await clickOnTestIdWithText(bobWindow1, 'message-request-banner');
    // Select message request from User A
    await clickOnTestIdWithText(
      bobWindow1,
      'module-conversation__user__profile-name',
      alice.userName,
    );
    // Check that using the accept button has intended use
    await clickOnTestIdWithText(
      bobWindow1,
      'decline-message-request',
      localize('decline').toString(),
    );
    // Confirm decline
    await clickOnTestIdWithText(
      bobWindow1,
      'session-confirm-ok-button',
      localize('delete').toString(),
    );
    // Check config message of message request acceptance
    await waitForMatchingText(
      bobWindow1,
      localize('messageRequestsNonePending').toString(),
    );
  },
);

test_Alice_1W_Bob_1W(
  'Message requests clear all',
  async ({ alice, aliceWindow1, bob, bobWindow1 }) => {
    const testMessage = `Sender: ${alice.userName}, Receiver: ${bob.userName}`;
    // send a message to User B from User A
    await sendNewMessage(aliceWindow1, bob.accountid, `${testMessage}`);
    // Check the message request banner appears and click on it
    await clickOnTestIdWithText(bobWindow1, 'message-request-banner');
    // Select 'Clear All' button
    await clickOnMatchingText(bobWindow1, localize('clearAll').toString());
    // Confirm decline
    await clickOnTestIdWithText(
      bobWindow1,
      'session-confirm-ok-button',
      localize('clear').toString(),
    );
    // Navigate back to message request folder to check
    await clickOnTestIdWithText(bobWindow1, 'settings-section');

    await clickOnTestIdWithText(
      bobWindow1,
      'message-requests-settings-menu-item',
      localize('sessionMessageRequests').toString(),
    );
    // Check config message of message request acceptance
    await waitForMatchingText(
      bobWindow1,
      localize('messageRequestsNonePending').toString(),
    );
  },
);

// Clear all requests

// Delete request (not a feature yet)
// Block request (not a feature yet)
