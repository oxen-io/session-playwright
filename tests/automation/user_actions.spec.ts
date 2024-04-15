import { expect } from '@playwright/test';
import { sleepFor } from '../promise_utils';
import { newUser } from './setup/new_user';
import {
  sessionTestTwoWindows,
  test_Alice1_Bob1,
  test_Alice1_no_network,
} from './setup/sessionTest';
import { createContact } from './utilities/create_contact';
import { sendMessage } from './utilities/message';
import {
  clickOnElement,
  clickOnMatchingText,
  clickOnTestIdWithText,
  typeIntoInput,
  typeIntoInputSlow,
  waitForMatchingText,
  waitForTestIdWithText,
} from './utilities/utils';

// Send message in one to one conversation with new contact
sessionTestTwoWindows('Create contact', async ([windowA, windowB]) => {
  const [userA, userB] = await Promise.all([
    newUser(windowA, 'Alice'),
    newUser(windowB, 'Bob'),
  ]);
  await createContact(windowA, windowB, userA, userB);
  // Navigate to contacts tab in User B's window
  await waitForTestIdWithText(
    windowB,
    'message-request-response-message',
    `You have accepted ${userA.userName}'s message request`,
  );
  await Promise.all([
    clickOnElement({
      window: windowA,
      strategy: 'data-testid',
      selector: 'new-conversation-button',
    }),
    clickOnElement({
      window: windowB,
      strategy: 'data-testid',
      selector: 'new-conversation-button',
    }),
  ]);
  await Promise.all([
    waitForTestIdWithText(
      windowA,
      'module-conversation__user__profile-name',
      userB.userName,
    ),
    waitForTestIdWithText(
      windowB,
      'module-conversation__user__profile-name',
      userA.userName,
    ),
  ]);
});

test_Alice1_Bob1(
  'Block user in conversation list',
  async ({ alice1, bob1, alice, bob }) => {
    // Create contact and send new message
    await createContact(alice1, bob1, alice, bob);
    // Check to see if User B is a contact
    await clickOnTestIdWithText(alice1, 'new-conversation-button');
    await waitForTestIdWithText(
      alice1,
      'module-conversation__user__profile-name',
      bob.userName,
    );
    // he is a contact, close the new conversation button tab as there is no right click allowed on it
    await clickOnTestIdWithText(alice1, 'new-conversation-button');
    // then right click on the contact conversation list item to show the menu
    await clickOnTestIdWithText(
      alice1,
      'module-conversation__user__profile-name',
      bob.userName,
      true,
    );
    // Select block
    await clickOnMatchingText(alice1, 'Block');
    // Verify toast notification 'blocked'
    await waitForTestIdWithText(alice1, 'session-toast', 'Blocked');
    // Verify the user was moved to the blocked contact list
    // Click on settings tab
    await clickOnTestIdWithText(alice1, 'settings-section');
    // click on settings section 'conversation'
    await clickOnTestIdWithText(alice1, 'conversations-settings-menu-item');
    // Navigate to blocked users tab'
    await clickOnTestIdWithText(alice1, 'reveal-blocked-user-settings');
    // select the contact to unblock by clicking on it by name
    await clickOnMatchingText(alice1, bob.userName);
    // Unblock user by clicking on unblock
    await clickOnTestIdWithText(alice1, 'unblock-button-settings-screen');
    // Verify toast notification says unblocked
    await waitForTestIdWithText(alice1, 'session-toast', 'Unblocked');
    await waitForMatchingText(alice1, 'No blocked contacts');
  },
);

test_Alice1_no_network('Change username', async ({ alice1 }) => {
  const newUsername = 'Tiny bubble';
  // Open Profile
  await clickOnTestIdWithText(alice1, 'leftpane-primary-avatar');
  // Click on current username to open edit field
  await clickOnTestIdWithText(alice1, 'edit-profile-icon');
  // Type in new username
  await typeIntoInput(alice1, 'profile-name-input', newUsername);
  // await window.fill('.profile-name-input', 'new username');
  // Press enter to confirm username input
  await alice1.keyboard.press('Enter');
  // Wait for Copy button to appear to verify username change
  await alice1.isVisible("'Copy'");
  // verify name change
  expect(await alice1.innerText('[data-testid=your-profile-name]')).toBe(
    newUsername,
  );
  // Exit profile module
  await clickOnTestIdWithText(alice1, 'modal-close-button');
});

test_Alice1_no_network('Change avatar', async ({ alice1 }) => {
  // Open profile
  await clickOnTestIdWithText(alice1, 'leftpane-primary-avatar');
  // Click on current profile picture
  await waitForTestIdWithText(alice1, 'copy-button-profile-update', 'Copy');

  await clickOnTestIdWithText(alice1, 'image-upload-section');
  await clickOnTestIdWithText(alice1, 'image-upload-click');
  await clickOnTestIdWithText(alice1, 'save-button-profile-update');
  await waitForTestIdWithText(alice1, 'loading-spinner');

  await sleepFor(500);
  const leftpaneAvatarContainer = await waitForTestIdWithText(
    alice1,
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
      expect(screenshot).toMatchSnapshot({ name: 'avatar-updated-blue.jpeg' });
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
    throw new Error('waiting 20s and still the screenshot is not right');
  }
});

test_Alice1_Bob1('Set nickname', async ({ alice1, bob1, alice, bob }) => {
  const nickname = 'new nickname for Bob';

  await createContact(alice1, bob1, alice, bob);
  await clickOnElement({
    window: alice1,
    strategy: 'data-testid',
    selector: 'message-section',
  });
  await clickOnTestIdWithText(
    alice1,
    'module-conversation__user__profile-name',
    bob.userName,
    true,
  );
  await clickOnMatchingText(alice1, 'Change Nickname');
  await sleepFor(1000);

  await typeIntoInputSlow(alice1, 'nickname-input', nickname);
  await sleepFor(100);
  await clickOnTestIdWithText(alice1, 'confirm-nickname', 'OK');
  const headerUsername = await waitForTestIdWithText(
    alice1,
    'header-conversation-name',
  );
  const headerUsernameText = await headerUsername.innerText();
  console.warn('Innertext ', headerUsernameText);

  expect(headerUsernameText).toBe(nickname);
  // Check conversation list name also
  const conversationListUsernameText = await waitForTestIdWithText(
    alice1,
    'module-conversation__user__profile-name',
  );
  const conversationListUsername =
    await conversationListUsernameText.innerText();
  expect(conversationListUsername).toBe(nickname);
});

test_Alice1_Bob1('Read status', async ({ alice1, bob1, alice, bob }) => {
  await createContact(alice1, bob1, alice, bob);
  await clickOnElement({
    window: alice1,
    strategy: 'data-testid',
    selector: 'settings-section',
  });
  await clickOnElement({
    window: alice1,
    strategy: 'data-testid',
    selector: 'enable-read-receipts',
  });
  await clickOnElement({
    window: alice1,
    strategy: 'data-testid',
    selector: 'message-section',
  });
  await clickOnTestIdWithText(
    alice1,
    'module-conversation__user__profile-name',
    bob.userName,
  );
  await clickOnElement({
    window: bob1,
    strategy: 'data-testid',
    selector: 'settings-section',
  });
  await clickOnElement({
    window: bob1,
    strategy: 'data-testid',
    selector: 'enable-read-receipts',
  });
  await clickOnElement({
    window: bob1,
    strategy: 'data-testid',
    selector: 'message-section',
  });
  await clickOnTestIdWithText(
    bob1,
    'module-conversation__user__profile-name',
    alice.userName,
  );
  await sendMessage(alice1, 'Testing read receipts');
});
