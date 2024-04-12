import { expect } from '@playwright/test';
import { sleepFor } from '../promise_utils';
import { newUser } from './setup/new_user';
import {
  sessionTestOneWindow,
  sessionTestTwoWindows,
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

sessionTestTwoWindows(
  'Block user in conversation list',
  async ([windowA, windowB]) => {
    // Open app and create user
    const [userA, userB] = await Promise.all([
      newUser(windowA, 'Alice'),
      newUser(windowB, 'Bob'),
    ]);
    // Create contact and send new message
    await createContact(windowA, windowB, userA, userB);
    // Check to see if User B is a contact
    await clickOnTestIdWithText(windowA, 'new-conversation-button');
    await waitForTestIdWithText(
      windowA,
      'module-conversation__user__profile-name',
      userB.userName,
    );
    await clickOnTestIdWithText(
      windowA,
      'module-conversation__user__profile-name',
      userB.userName,
      true,
    );
    // Select block
    await clickOnMatchingText(windowA, 'Block');
    // Verify toast notification 'blocked'
    await waitForTestIdWithText(windowA, 'session-toast', 'Blocked');
    // Verify the user was moved to the blocked contact list
    // Click on settings tab
    await clickOnTestIdWithText(windowA, 'settings-section');
    // click on settings section 'conversation'
    await clickOnTestIdWithText(windowA, 'conversations-settings-menu-item');
    // Navigate to blocked users tab'
    await clickOnTestIdWithText(windowA, 'reveal-blocked-user-settings');
    // select the contact to unblock by clicking on it by name
    await clickOnMatchingText(windowA, userB.userName);
    // Unblock user by clicking on unblock
    await clickOnTestIdWithText(windowA, 'unblock-button-settings-screen');
    // Verify toast notification says unblocked
    await waitForTestIdWithText(windowA, 'session-toast', 'Unblocked');
    await waitForMatchingText(windowA, 'No blocked contacts');
  },
);

sessionTestOneWindow('Change username', async ([window]) => {
  // Create user
  const newUsername = 'Tiny bubble';
  await newUser(window, 'Alice');
  // Open Profile
  await clickOnTestIdWithText(window, 'leftpane-primary-avatar');
  // Click on current username to open edit field
  await clickOnTestIdWithText(window, 'edit-profile-icon');
  // Type in new username
  await typeIntoInput(window, 'profile-name-input', newUsername);
  // await window.fill('.profile-name-input', 'new username');
  // Press enter to confirm username input
  await window.keyboard.press('Enter');
  // Wait for Copy button to appear to verify username change
  await window.isVisible("'Copy'");
  // verify name change
  expect(await window.innerText('[data-testid=your-profile-name]')).toBe(
    newUsername,
  );
  // Exit profile module
  await window.click('.session-icon-button.small');
});

sessionTestOneWindow('Change avatar', async ([window]) => {
  await newUser(window, 'Alice');
  // Open profile
  await clickOnTestIdWithText(window, 'leftpane-primary-avatar');
  // Click on current profile picture
  await waitForTestIdWithText(window, 'copy-button-profile-update', 'Copy');

  await clickOnTestIdWithText(window, 'image-upload-section');
  await clickOnTestIdWithText(window, 'image-upload-click');
  await clickOnTestIdWithText(window, 'save-button-profile-update');
  await waitForTestIdWithText(window, 'loading-spinner');

  await sleepFor(500);
  const leftpaneAvatarContainer = await waitForTestIdWithText(
    window,
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

sessionTestTwoWindows('Set nickname', async ([windowA, windowB]) => {
  const [userA, userB] = await Promise.all([
    newUser(windowA, 'Alice'),
    newUser(windowB, 'Bob'),
  ]);
  const nickname = 'new nickname for Bob';

  await createContact(windowA, windowB, userA, userB);
  await clickOnElement({
    window: windowA,
    strategy: 'data-testid',
    selector: 'message-section',
  });
  await clickOnTestIdWithText(
    windowA,
    'module-conversation__user__profile-name',
    userB.userName,
    true,
  );
  await clickOnMatchingText(windowA, 'Change Nickname');
  await sleepFor(1000);

  await typeIntoInputSlow(windowA, 'nickname-input', nickname);
  await sleepFor(100);
  await clickOnTestIdWithText(windowA, 'confirm-nickname', 'OK');
  const headerUsername = await waitForTestIdWithText(
    windowA,
    'header-conversation-name',
  );
  const headerUsernameText = await headerUsername.innerText();
  console.warn('Innertext ', headerUsernameText);

  expect(headerUsernameText).toBe(nickname);
  // Check conversation list name also
  const conversationListUsernameText = await waitForTestIdWithText(
    windowA,
    'module-conversation__user__profile-name',
  );
  const conversationListUsername =
    await conversationListUsernameText.innerText();
  expect(conversationListUsername).toBe(nickname);
});

sessionTestTwoWindows('Read status', async ([windowA, windowB]) => {
  const [userA, userB] = await Promise.all([
    newUser(windowA, 'Alice'),
    newUser(windowB, 'Bob'),
  ]);
  await createContact(windowA, windowB, userA, userB);
  await clickOnElement({
    window: windowA,
    strategy: 'data-testid',
    selector: 'settings-section',
  });
  await clickOnElement({
    window: windowA,
    strategy: 'data-testid',
    selector: 'enable-read-receipts',
  });
  await clickOnElement({
    window: windowA,
    strategy: 'data-testid',
    selector: 'message-section',
  });
  await clickOnTestIdWithText(
    windowA,
    'module-conversation__user__profile-name',
    userB.userName,
  );
  await clickOnElement({
    window: windowB,
    strategy: 'data-testid',
    selector: 'settings-section',
  });
  await clickOnElement({
    window: windowB,
    strategy: 'data-testid',
    selector: 'enable-read-receipts',
  });
  await clickOnElement({
    window: windowB,
    strategy: 'data-testid',
    selector: 'message-section',
  });
  await clickOnTestIdWithText(
    windowB,
    'module-conversation__user__profile-name',
    userA.userName,
  );
  await sendMessage(windowA, 'Testing read receipts');
});
