import { test_group_Alice_2W_Bob_1W_Charlie_1W } from './setup/sessionTest';
import { leaveGroup } from './utilities/leave_group';
import {
  clickOnTestIdWithText,
  waitForTestIdWithText,
} from './utilities/utils';

test_group_Alice_2W_Bob_1W_Charlie_1W(
  'Check group and name syncs',
  async ({ aliceWindow2, groupCreated }) => {
    // Check group conversation is in conversation list on linked device
    await waitForTestIdWithText(
      aliceWindow2,
      'module-conversation__user__profile-name',
      groupCreated.userName,
    );
  },
);

test_group_Alice_2W_Bob_1W_Charlie_1W(
  'Leaving group syncs',
  async ({
    aliceWindow1,
    aliceWindow2,
    bobWindow1,
    charlie,
    charlieWindow1,
    groupCreated,
  }) => {
    // Check group conversation is in conversation list of linked device
    await waitForTestIdWithText(
      aliceWindow2,
      'module-conversation__user__profile-name',
      groupCreated.userName,
    );
    // User C to leave group
    await leaveGroup(charlieWindow1, groupCreated);
    // Check for user A for control message that userC left group
    // await sleepFor(1000);
    // Click on group
    await clickOnTestIdWithText(
      aliceWindow1,
      'module-conversation__user__profile-name',
      groupCreated.userName,
    );
    // Control-message needs to be changed to group-update-message (on disappearing messages branch)
    await waitForTestIdWithText(
      aliceWindow1,
      'group-update-message',
      `"${charlie.userName}" has left the group.`,
    );
    // Check for linked device (userA)
    await clickOnTestIdWithText(
      aliceWindow2,
      'module-conversation__user__profile-name',
      groupCreated.userName,
    );
    // Control-message needs to be changed to group-update-message (on disappearing messages branch)
    await waitForTestIdWithText(
      aliceWindow2,
      'group-update-message',
      `"${charlie.userName}" has left the group.`,
    );
    // Check for user B
    // Control-message needs to be changed to group-update-message (on disappearing messages branch)
    await waitForTestIdWithText(
      bobWindow1,
      'group-update-message',
      `"${charlie.userName}" has left the group.`,
    );
  },
);
