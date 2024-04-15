import { test_group_Alice2_Bob1_Charlie1 } from './setup/sessionTest';
import { leaveGroup } from './utilities/leave_group';
import {
  clickOnTestIdWithText,
  waitForTestIdWithText,
} from './utilities/utils';

test_group_Alice2_Bob1_Charlie1(
  'Check group and name syncs',
  async ({ alice2, groupCreated }) => {
    // Check group conversation is in conversation list on linked device
    await waitForTestIdWithText(
      alice2,
      'module-conversation__user__profile-name',
      groupCreated.userName,
    );
  },
);

test_group_Alice2_Bob1_Charlie1(
  'Leaving group syncs',
  async ({ alice1, alice2, bob1, charlie, charlie1, groupCreated }) => {
    // Check group conversation is in conversation list of linked device
    await waitForTestIdWithText(
      alice2,
      'module-conversation__user__profile-name',
      groupCreated.userName,
    );
    // User C to leave group
    await leaveGroup(charlie1, groupCreated);
    // Check for user A for control message that userC left group
    // await sleepFor(1000);
    // Click on group
    await clickOnTestIdWithText(
      alice1,
      'module-conversation__user__profile-name',
      groupCreated.userName,
    );
    // Control-message needs to be changed to group-update-message (on disappearing messages branch)
    await waitForTestIdWithText(
      alice1,
      'group-update-message',
      `"${charlie.userName}" has left the group.`,
    );
    // Check for linked device (userA)
    await clickOnTestIdWithText(
      alice2,
      'module-conversation__user__profile-name',
      groupCreated.userName,
    );
    // Control-message needs to be changed to group-update-message (on disappearing messages branch)
    await waitForTestIdWithText(
      alice2,
      'group-update-message',
      `"${charlie.userName}" has left the group.`,
    );
    // Check for user B
    // Control-message needs to be changed to group-update-message (on disappearing messages branch)
    await waitForTestIdWithText(
      bob1,
      'group-update-message',
      `"${charlie.userName}" has left the group.`,
    );
  },
);
