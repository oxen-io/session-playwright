import { expect } from '@playwright/test';
import { createGroup } from './setup/create_group';
import { renameGroup } from './utilities/rename_group';
import {
  clickOnElement,
  clickOnMatchingText,
  clickOnTestIdWithText,
  typeIntoInput,
  waitForMatchingText,
  waitForTestIdWithText,
} from './utilities/utils';
// import { leaveGroup } from './utilities/leave_group';
import { sleepFor } from '../promise_utils';
import { newUser } from './setup/new_user';
import {
  sessionTestThreeWindows,
  test_group_Alice1_Bob1_Charlie1,
  test_group_Alice1_Bob1_Charlie1_Dracula1,
} from './setup/sessionTest';
import { createContact } from './utilities/create_contact';
import { leaveGroup } from './utilities/leave_group';

// Note: Note using the group fixture here as we want to test it thorougly
sessionTestThreeWindows('Create group', async ([windowA, windowB, windowC]) => {
  // Open Electron
  const [userA, userB, userC] = await Promise.all([
    newUser(windowA, 'Alice'),
    newUser(windowB, 'Bob'),
    newUser(windowC, 'Charlie'),
  ]);

  await createGroup(
    'Test for group creation',
    userA,
    windowA,
    userB,
    windowB,
    userC,
    windowC,
  );
  // Check config messages in all windows
  await sleepFor(1000);
  // await waitForTestIdWithText(windowA, 'control-message');
});

test_group_Alice1_Bob1_Charlie1_Dracula1(
  'Add contact to group',
  async ({
    alice,
    alice1,
    bob1,
    charlie1,
    dracula,
    dracula1,
    groupCreated,
  }) => {
    // Check config messages in all windows
    await sleepFor(1000);
    await createContact(alice1, dracula1, alice, dracula);
    await clickOnElement({
      window: alice1,
      strategy: 'data-testid',
      selector: 'message-section',
    });
    await clickOnTestIdWithText(
      alice1,
      'module-conversation__user__profile-name',
      groupCreated.userName,
    );
    await clickOnElement({
      window: alice1,
      strategy: 'data-testid',
      selector: 'conversation-options-avatar',
    });
    await clickOnElement({
      window: alice1,
      strategy: 'data-testid',
      selector: 'add-user-button',
    });
    // Waiting for animation of right panel to appear
    await sleepFor(1000);
    await clickOnMatchingText(alice1, dracula.userName);
    await clickOnMatchingText(alice1, 'OK');
    await waitForTestIdWithText(
      alice1,
      'group-update-message',
      `"${dracula.userName}" joined the group.`,
    );
    await waitForTestIdWithText(
      bob1,
      'group-update-message',
      `${dracula.sessionid} joined the group.`,
    );
    await waitForTestIdWithText(
      charlie1,
      'group-update-message',
      `${dracula.sessionid} joined the group.`,
    );
    await clickOnElement({
      window: dracula1,
      strategy: 'data-testid',
      selector: 'message-section',
    });
    await clickOnTestIdWithText(
      dracula1,
      'module-conversation__user__profile-name',
      groupCreated.userName,
    );
    // Update in closed group rewrite
    //   const emptyStateGroupText = `You have no messages from ${testGroup.userName}. Send a message to start the conversation!`;
    //   await waitForTestIdWithText(
    //     windowD,
    //     'empty-conversation-notification',
    //     emptyStateGroupText,
    //   );
  },
);

test_group_Alice1_Bob1_Charlie1(
  'Change group name',
  async ({ alice1, bob1, charlie1, groupCreated }) => {
    const newGroupName = 'New group name';

    // Change the name of the group and check that it syncs to all devices (config messages)
    // Click on already created group
    // Check that renaming a group is working
    await renameGroup(alice1, groupCreated.userName, newGroupName);
    // Check config message in window B for group name change
    await clickOnMatchingText(bob1, newGroupName);
    await waitForMatchingText(bob1, `Group name is now '${newGroupName}'.`);
    await clickOnMatchingText(charlie1, newGroupName);
    await waitForMatchingText(charlie1, `Group name is now '${newGroupName}'.`);
    // Click on conversation options
    // Check to see that you can't change group name to empty string
    // Click on edit group name
    await clickOnTestIdWithText(alice1, 'conversation-options-avatar');
    await clickOnTestIdWithText(alice1, 'edit-group-name');
    await typeIntoInput(alice1, 'group-name-input', '     ');
    await alice1.keyboard.press('Enter');
    const errorMessage = alice1.locator('.error-message');
    await expect(errorMessage).toContainText('Please enter a group name');
    await clickOnMatchingText(alice1, 'Cancel');
    await clickOnTestIdWithText(alice1, 'back-button-conversation-options');
  },
);

test_group_Alice1_Bob1_Charlie1(
  'Test mentions',
  async ({ alice, alice1, bob, bob1, charlie, charlie1, groupCreated }) => {
    // in windowA we should be able to mentions bob and userC

    await clickOnTestIdWithText(
      alice1,
      'module-conversation__user__profile-name',
      groupCreated.userName,
    );
    await typeIntoInput(alice1, 'message-input-text-area', '@');
    // does 'message-input-text-area' have aria-expanded: true when @ is typed into input
    await waitForTestIdWithText(alice1, 'mentions-popup-row');
    await waitForTestIdWithText(alice1, 'mentions-popup-row', bob.userName);
    await waitForTestIdWithText(alice1, 'mentions-popup-row', charlie.userName);

    // in windowB we should be able to mentions alice and charlie
    await clickOnTestIdWithText(
      bob1,
      'module-conversation__user__profile-name',
      groupCreated.userName,
    );
    await typeIntoInput(bob1, 'message-input-text-area', '@');
    // does 'message-input-text-area' have aria-expanded: true when @ is typed into input
    await waitForTestIdWithText(bob1, 'mentions-popup-row');
    await waitForTestIdWithText(bob1, 'mentions-popup-row', alice.userName);
    await waitForTestIdWithText(bob1, 'mentions-popup-row', charlie.userName);

    // in charlie1 we should be able to mentions alice and userB
    await clickOnTestIdWithText(
      charlie1,
      'module-conversation__user__profile-name',
      groupCreated.userName,
    );
    await typeIntoInput(charlie1, 'message-input-text-area', '@');
    // does 'message-input-text-area' have aria-expanded: true when @ is typed into input
    await waitForTestIdWithText(charlie1, 'mentions-popup-row');
    await waitForTestIdWithText(charlie1, 'mentions-popup-row', alice.userName);
    await waitForTestIdWithText(charlie1, 'mentions-popup-row', bob.userName);
  },
);

test_group_Alice1_Bob1_Charlie1(
  'Leave group',
  async ({ charlie1, groupCreated }) => {
    await leaveGroup(charlie1, groupCreated);
  },
);
