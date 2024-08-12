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
  test_group_Alice_1W_Bob_1W_Charlie_1W,
  test_group_Alice_1W_Bob_1W_Charlie_1W_Dracula_1W,
} from './setup/sessionTest';
import { createContact } from './utilities/create_contact';
import { leaveGroup } from './utilities/leave_group';

// Note: Note using the group fixture here as we want to test it thoroughly
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

test_group_Alice_1W_Bob_1W_Charlie_1W_Dracula_1W(
  'Add contact to group',
  async ({
    alice,
    aliceWindow1,
    bobWindow1,
    charlieWindow1,
    dracula,
    draculaWindow1,
    groupCreated,
  }) => {
    // Check config messages in all windows
    await sleepFor(1000);
    await createContact(aliceWindow1, draculaWindow1, alice, dracula);
    await clickOnElement({
      window: aliceWindow1,
      strategy: 'data-testid',
      selector: 'message-section',
    });
    await clickOnTestIdWithText(
      aliceWindow1,
      'module-conversation__user__profile-name',
      groupCreated.userName,
    );
    await clickOnElement({
      window: aliceWindow1,
      strategy: 'data-testid',
      selector: 'conversation-options-avatar',
    });
    await clickOnElement({
      window: aliceWindow1,
      strategy: 'data-testid',
      selector: 'add-user-button',
    });
    // Waiting for animation of right panel to appear
    await sleepFor(1000);
    await clickOnMatchingText(aliceWindow1, dracula.userName);
    await clickOnMatchingText(aliceWindow1, 'OK');
    await waitForTestIdWithText(
      aliceWindow1,
      'group-update-message',
      `"${dracula.userName}" joined the group.`,
    );
    await waitForTestIdWithText(
      bobWindow1,
      'group-update-message',
      `${dracula.accountid} joined the group.`,
    );
    await waitForTestIdWithText(
      charlieWindow1,
      'group-update-message',
      `${dracula.accountid} joined the group.`,
    );
    await clickOnElement({
      window: draculaWindow1,
      strategy: 'data-testid',
      selector: 'message-section',
    });
    await clickOnTestIdWithText(
      draculaWindow1,
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

test_group_Alice_1W_Bob_1W_Charlie_1W(
  'Change group name',
  async ({ aliceWindow1, bobWindow1, charlieWindow1, groupCreated }) => {
    const newGroupName = 'New group name';

    // Change the name of the group and check that it syncs to all devices (config messages)
    // Click on already created group
    // Check that renaming a group is working
    await renameGroup(aliceWindow1, groupCreated.userName, newGroupName);
    // Check config message in window B for group name change
    await clickOnMatchingText(bobWindow1, newGroupName);
    await waitForMatchingText(
      bobWindow1,
      `Group name is now '${newGroupName}'.`,
    );
    await clickOnMatchingText(charlieWindow1, newGroupName);
    await waitForMatchingText(
      charlieWindow1,
      `Group name is now '${newGroupName}'.`,
    );
    // Click on conversation options
    // Check to see that you can't change group name to empty string
    // Click on edit group name
    await clickOnTestIdWithText(aliceWindow1, 'conversation-options-avatar');
    await clickOnTestIdWithText(aliceWindow1, 'edit-group-name');
    await typeIntoInput(aliceWindow1, 'group-name-input', '     ');
    await aliceWindow1.keyboard.press('Enter');
    await waitForMatchingText(aliceWindow1, 'Please enter a group name');
    // const errorMessage = aliceWindow1.locator('.error-message');
    // await expect(errorMessage).toContainText('Please enter a group name');
    await clickOnMatchingText(aliceWindow1, 'Cancel');
    await clickOnTestIdWithText(
      aliceWindow1,
      'back-button-conversation-options',
    );
  },
);

test_group_Alice_1W_Bob_1W_Charlie_1W(
  'Test mentions',
  async ({
    alice,
    aliceWindow1,
    bob,
    bobWindow1,
    charlie,
    charlieWindow1,
    groupCreated,
  }) => {
    // in windowA we should be able to mentions bob and userC

    await clickOnTestIdWithText(
      aliceWindow1,
      'module-conversation__user__profile-name',
      groupCreated.userName,
    );
    await typeIntoInput(aliceWindow1, 'message-input-text-area', '@');
    // does 'message-input-text-area' have aria-expanded: true when @ is typed into input
    await waitForTestIdWithText(aliceWindow1, 'mentions-popup-row');
    await waitForTestIdWithText(
      aliceWindow1,
      'mentions-popup-row',
      bob.userName,
    );
    await waitForTestIdWithText(
      aliceWindow1,
      'mentions-popup-row',
      charlie.userName,
    );

    // in windowB we should be able to mentions alice and charlie
    await clickOnTestIdWithText(
      bobWindow1,
      'module-conversation__user__profile-name',
      groupCreated.userName,
    );
    await typeIntoInput(bobWindow1, 'message-input-text-area', '@');
    // does 'message-input-text-area' have aria-expanded: true when @ is typed into input
    await waitForTestIdWithText(bobWindow1, 'mentions-popup-row');
    await waitForTestIdWithText(
      bobWindow1,
      'mentions-popup-row',
      alice.userName,
    );
    await waitForTestIdWithText(
      bobWindow1,
      'mentions-popup-row',
      charlie.userName,
    );

    // in charlieWindow1 we should be able to mentions alice and userB
    await clickOnTestIdWithText(
      charlieWindow1,
      'module-conversation__user__profile-name',
      groupCreated.userName,
    );
    await typeIntoInput(charlieWindow1, 'message-input-text-area', '@');
    // does 'message-input-text-area' have aria-expanded: true when @ is typed into input
    await waitForTestIdWithText(charlieWindow1, 'mentions-popup-row');
    await waitForTestIdWithText(
      charlieWindow1,
      'mentions-popup-row',
      alice.userName,
    );
    await waitForTestIdWithText(
      charlieWindow1,
      'mentions-popup-row',
      bob.userName,
    );
  },
);

test_group_Alice_1W_Bob_1W_Charlie_1W(
  'Leave group',
  async ({ charlieWindow1, groupCreated }) => {
    await leaveGroup(charlieWindow1, groupCreated);
  },
);
