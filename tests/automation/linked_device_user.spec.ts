/* eslint-disable no-await-in-loop */
import { Page, expect } from '@playwright/test';
import { sleepFor } from '../promise_utils';
import { forceCloseAllWindows } from './setup/beforeEach';
import { newUser } from './setup/new_user';
import {
  sessionTestOneWindow,
  test_Alice2,
  test_Alice2_Bob1,
} from './setup/sessionTest';
import { createContact } from './utilities/create_contact';
import { linkedDevice } from './utilities/linked_device';
import { sendMessage } from './utilities/message';
import {
  clickOnElement,
  clickOnMatchingText,
  clickOnTestIdWithText,
  clickOnTextMessage,
  doWhileWithMax,
  hasTextMessageBeenDeleted,
  typeIntoInput,
  waitForLoadingAnimationToFinish,
  waitForMatchingPlaceholder,
  waitForMatchingText,
  waitForTestIdWithText,
  waitForTextMessage,
} from './utilities/utils';

sessionTestOneWindow('Link a device', async ([alice1]) => {
  let alice2: Page | undefined;
  try {
    const userA = await newUser(alice1, 'Alice');
    alice2 = await linkedDevice(userA.recoveryPhrase); // not using fixture here as we want to check the behavior finely
    await clickOnTestIdWithText(alice1, 'leftpane-primary-avatar');
    // Verify Username
    await waitForTestIdWithText(alice1, 'your-profile-name', userA.userName);
    // Verify Session ID
    await waitForTestIdWithText(alice1, 'your-session-id', userA.sessionid);
    // exit profile module
    await clickOnTestIdWithText(alice1, 'modal-close-button');
    // You're almost finished isn't displayed
    const errorDesc = 'Should not be found';
    try {
      const elemShouldNotBeFound = alice2.locator(
        '[data-testid=reveal-recovery-phrase]',
      );
      if (elemShouldNotBeFound) {
        console.error(
          'Continue to save recovery phrase not found, excellent news',
        );
        throw new Error(errorDesc);
      }
    } catch (e) {
      if (e.message !== errorDesc) {
        // this is NOT ok
        throw e;
      }
    }
  } finally {
    if (alice2) {
      await forceCloseAllWindows([alice2]);
    }
  }
});

test_Alice2('Changed username syncs', async ({ alice1, alice2 }) => {
  const newUsername = 'Tiny bubble';
  await clickOnTestIdWithText(alice1, 'leftpane-primary-avatar');
  // Click on pencil icon
  await clickOnTestIdWithText(alice1, 'edit-profile-icon');
  // Replace old username with new username
  await typeIntoInput(alice1, 'profile-name-input', newUsername);
  // Press enter to confirm change
  await clickOnElement({
    window: alice1,
    strategy: 'data-testid',
    selector: 'save-button-profile-update',
  });
  // Wait for loading animation
  await waitForLoadingAnimationToFinish(alice1, 'loading-spinner');

  // Check username change in window B
  // Click on profile settings in window B
  // Waiting for the username to change
  await doWhileWithMax(
    15000,
    500,
    'waiting for updated username in profile dialog',
    async () => {
      await clickOnTestIdWithText(alice2, 'leftpane-primary-avatar');
      // Verify username has changed to new username
      try {
        await waitForTestIdWithText(
          alice2,
          'your-profile-name',
          newUsername,
          100,
        );
        return true;
      } catch (e) {
        // if waitForTestIdWithText doesn't find the right username, close the window and retry
        return false;
      } finally {
        await clickOnElement({
          window: alice2,
          strategy: 'data-testid',
          selector: 'modal-close-button',
        });
      }
    },
  );
});

test_Alice2('Profile picture syncs', async ({ alice1, alice2 }, testinfo) => {
  await clickOnTestIdWithText(alice1, 'leftpane-primary-avatar');
  // Click on current profile picture
  await waitForTestIdWithText(alice1, 'copy-button-profile-update', 'Copy');

  await clickOnTestIdWithText(alice1, 'image-upload-section');
  await clickOnTestIdWithText(alice1, 'image-upload-click');
  await clickOnTestIdWithText(alice1, 'save-button-profile-update');
  await waitForTestIdWithText(alice1, 'loading-spinner');

  if (testinfo.config.updateSnapshots === 'all') {
    await sleepFor(15000, true); // long time to be sure a poll happened when we want to update the snapshot
  } else {
    await sleepFor(2000); // short time as we will loop right below until the snapshot is what we expect
  }
  const leftpaneAvatarContainer = await waitForTestIdWithText(
    alice2,
    'leftpane-primary-avatar',
  );
  const start = Date.now();
  let correctScreenshot = false;
  let tryNumber = 0;
  let lastError: Error | undefined;
  do {
    try {
      await sleepFor(500);

      const screenshot = await leftpaneAvatarContainer.screenshot({
        type: 'jpeg',
        // path: 'avatar-updated-blue',
      });
      expect(screenshot).toMatchSnapshot({
        name: 'avatar-updated-blue.jpeg',
      });
      correctScreenshot = true;
      console.warn(
        `screenshot matching of "Check profile picture syncs" passed after "${tryNumber}" retries!`,
      );
    } catch (e) {
      lastError = e;
    }
    tryNumber++;
  } while (Date.now() - start <= 20000 && !correctScreenshot);

  if (!correctScreenshot) {
    console.warn(
      `screenshot matching of "Check profile picture syncs" try "${tryNumber}" failed with: ${lastError?.message}`,
    );
    throw new Error('waited 20s and still the screenshot is not right');
  }
});

test_Alice2_Bob1(
  'Contacts syncs',
  async ({ alice, alice1, alice2, bob, bob1 }) => {
    await createContact(alice1, bob1, alice, bob);
    // linked device (alice2)
    await waitForTestIdWithText(
      alice2,
      'module-conversation__user__profile-name',
      bob.userName,
    );
    console.info('Contacts correctly synced');
  },
);

test_Alice2_Bob1(
  'Deleted message syncs',
  async ({ alice, alice1, alice2, bob, bob1 }) => {
    const messageToDelete = 'Testing deletion functionality for linked device';
    await createContact(alice1, bob1, alice, bob);
    await sendMessage(alice1, messageToDelete);
    // Navigate to conversation on linked device and for message from user A to user B
    await clickOnTestIdWithText(
      alice2,
      'module-conversation__user__profile-name',
      bob.userName,
    );
    await Promise.all([
      waitForTextMessage(alice2, messageToDelete),
      waitForTextMessage(bob1, messageToDelete),
    ]);
    await clickOnTextMessage(alice1, messageToDelete, true);
    await clickOnMatchingText(alice1, 'Delete');
    await clickOnTestIdWithText(alice1, 'session-confirm-ok-button', 'Delete');
    await waitForTestIdWithText(alice1, 'session-toast', 'Deleted');
    await hasTextMessageBeenDeleted(alice1, messageToDelete, 6000);
    // linked device for deleted message
    // Waiting for message to be removed
    // Check for linked device
    await hasTextMessageBeenDeleted(alice2, messageToDelete, 10000);
    // Still should exist for user B
    await waitForMatchingText(bob1, messageToDelete);
  },
);

test_Alice2_Bob1(
  'Unsent message syncs',
  async ({ alice, alice1, alice2, bob, bob1 }) => {
    const unsentMessage = 'Testing unsending functionality for linked device';
    await createContact(alice1, bob1, alice, bob);
    await sendMessage(alice1, unsentMessage);
    // Navigate to conversation on linked device and for message from user A to user B
    await clickOnTestIdWithText(
      alice2,
      'module-conversation__user__profile-name',
      bob.userName,
    );
    await Promise.all([
      waitForTextMessage(alice2, unsentMessage),
      waitForTextMessage(bob1, unsentMessage),
    ]);
    await clickOnTextMessage(alice1, unsentMessage, true);
    await clickOnMatchingText(alice1, 'Delete');
    await clickOnMatchingText(alice1, 'Delete for everyone');
    await clickOnElement({
      window: alice1,
      strategy: 'data-testid',
      selector: 'session-confirm-ok-button',
    });
    await waitForTestIdWithText(alice1, 'session-toast', 'Deleted');
    await hasTextMessageBeenDeleted(alice1, unsentMessage, 1000);
    await waitForMatchingText(bob1, 'This message has been deleted');
    // linked device for deleted message
    await hasTextMessageBeenDeleted(alice2, unsentMessage, 1000);
  },
);

test_Alice2_Bob1(
  'Blocked user syncs',
  async ({ alice, alice1, alice2, bob, bob1 }) => {
    const testMessage = 'Testing blocking functionality for linked device';

    await createContact(alice1, bob1, alice, bob);
    await sendMessage(alice1, testMessage);
    // Navigate to conversation on linked device and check for message from user A to user B
    await clickOnTestIdWithText(
      alice2,
      'module-conversation__user__profile-name',
      bob.userName,
      true,
    );
    // Select block
    await clickOnMatchingText(alice2, 'Block');
    // Verify toast notification 'blocked'
    await waitForTestIdWithText(alice2, 'session-toast', 'Blocked');
    // Verify the user was moved to the blocked contact list
    // Click on settings tab
    await waitForMatchingPlaceholder(
      alice1,
      'message-input-text-area',
      'Unblock this contact to send a message.',
    );
    // reveal-blocked-user-settings is not updated once opened
    // Check linked device for blocked contact in settings screen
    await clickOnTestIdWithText(alice2, 'settings-section');
    await clickOnTestIdWithText(alice2, 'conversations-settings-menu-item');
    // a conf sync job can take 30s (if the last one failed) +  10s polling to show a change on a linked device.
    await clickOnTestIdWithText(
      alice2,
      'reveal-blocked-user-settings',
      undefined,
      undefined,
      50000,
    );
    // Check if user B is in blocked contact list
    await waitForMatchingText(alice2, bob.userName);
  },
);
