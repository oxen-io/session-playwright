import { createGroup } from './setup/create_group';
import { newUser } from './setup/new_user';
import { sessionTestThreeWindows } from './setup/sessionTest';
import { leaveGroup } from './utilities/leave_group';
import { linkedDevice } from './utilities/linked_device';
import {
  clickOnTestIdWithText,
  waitForTestIdWithText,
} from './utilities/utils';

sessionTestThreeWindows(
  'Check group and name syncs',
  async ([windowA, windowB, windowC]) => {
    const [userA, userB, userC] = await Promise.all([
      newUser(windowA, 'Alice'),
      newUser(windowB, 'Bob'),
      newUser(windowC, 'Charlie'),
    ]);
    const [windowD] = await linkedDevice(userA.recoveryPhrase);

    const group = await createGroup(
      'Testing group creation',
      userA,
      windowA,
      userB,
      windowB,
      userC,
      windowC,
    );
    // Check group conversation is in conversation list on linked device
    await waitForTestIdWithText(
      windowD,
      'module-conversation__user__profile-name',
      group.userName,
    );
  },
);

sessionTestThreeWindows(
  'Leaving group syncs',
  async ([windowA, windowC, windowD]) => {
    const [userA, userB, userC] = await Promise.all([
      newUser(windowA, 'Alice'),
      newUser(windowC, 'Bob'),
      newUser(windowD, 'Charlie'),
    ]);
    const [windowB] = await linkedDevice(userA.recoveryPhrase);

    const group = await createGroup(
      'Testing leaving a group',
      userA,
      windowA,
      userB,
      windowC,
      userC,
      windowD,
    );
    // Check group conversation is in conversation list of linked device
    await waitForTestIdWithText(
      windowB,
      'module-conversation__user__profile-name',
      group.userName,
    );
    // User C to leave group
    await leaveGroup(windowD, group);
    // Check for user A for control message that userC left group
    // await sleepFor(1000);
    // Click on group
    await clickOnTestIdWithText(
      windowA,
      'module-conversation__user__profile-name',
      group.userName,
    );
    // Control-message needs to be changed to group-update-message (on disappearing messages branch)
    await waitForTestIdWithText(
      windowA,
      'group-update-message',
      `"${userC.userName}" has left the group.`,
    );
    // Check for linked device (userA)
    await clickOnTestIdWithText(
      windowB,
      'module-conversation__user__profile-name',
      group.userName,
    );
    // Control-message needs to be changed to group-update-message (on disappearing messages branch)
    await waitForTestIdWithText(
      windowB,
      'group-update-message',
      `"${userC.userName}" has left the group.`,
    );
    // Check for user B
    // Control-message needs to be changed to group-update-message (on disappearing messages branch)
    await waitForTestIdWithText(
      windowC,
      'group-update-message',
      `"${userC.userName}" has left the group.`,
    );
  },
);
