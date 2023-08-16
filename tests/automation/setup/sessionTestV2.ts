/* eslint-disable no-useless-catch */
/* eslint-disable no-empty-pattern */
/* eslint-disable @typescript-eslint/array-type  */

import { Page, test } from '@playwright/test';
import {
  OpenWindowsType,
  beforeAllClean,
  forceCloseAllWindowsObj,
} from './beforeEach';
import {
  EmptyWindow,
  NewUserWindow,
  OneFriendWindow,
} from './fixtures/EmptyPage';
import { openApp } from './open';
import { createContact } from '../utilities/create_contact';

type SessionFixtures = {
  oneEmpty: { windowA: EmptyWindow };
  twoEmpty: { windowA: EmptyWindow; windowB: EmptyWindow };
  userCreated: { windowA: NewUserWindow };
  twoUsersCreated: {
    windowA: NewUserWindow;
    windowB: NewUserWindow;
  };
  twoFriends: {
    windowA: OneFriendWindow;
    windowB: OneFriendWindow;
  };
};

async function openWindows<T extends 1 | 2 | 3 | 4 | 5>(
  count: T
): Promise<OpenWindowsType> {
  beforeAllClean();
  const windows = await openApp(count);
  if (windows.length !== count) {
    throw new Error(`openApp should have opened ${count} windows but did not.`);
  }

  switch (count) {
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
      return {
        windowA: windows[0],
        windowB: windows?.[1] as Page | undefined,
        windowC: windows?.[2] as Page | undefined,
        windowD: windows?.[3] as Page | undefined,
        windowE: windows?.[4] as Page | undefined,
      };
    default:
      throw new Error(`idk what to do with count=${count} yet`);
  }
}
export type SessionOptions = {
  firstDisplayName: string;
  secondDisplayName: string;
  thirdDisplayName: string;
  fourthDisplayName: string;
  fifthDisplayName: string;
};

export const sessionTestV2 = test.extend<SessionOptions & SessionFixtures>({
  firstDisplayName: 'Alice',
  secondDisplayName: 'Bob',
  thirdDisplayName: 'Charlie',
  fourthDisplayName: 'Dave',
  fifthDisplayName: 'Erin',

  oneEmpty: async ({}, use) => {
    let windows: OpenWindowsType = {};

    try {
      const count = 1;
      windows = await openWindows<typeof count>(count);

      if (!windows.windowA) {
        throw new Error('Failed to create windowA');
      }

      await use({ windowA: new EmptyWindow(windows.windowA) });
    } finally {
      await forceCloseAllWindowsObj(windows);
    }
  },
  userCreated: async ({ oneEmpty, firstDisplayName }, use) => {
    const user = await oneEmpty.windowA.createUser(firstDisplayName);
    const loggedInWindow = new NewUserWindow(oneEmpty.windowA, user);

    await use({ windowA: loggedInWindow });
  },
  twoEmpty: async ({}, use) => {
    let windows: OpenWindowsType = {};

    try {
      const count = 2;
      windows = await openWindows<typeof count>(count);

      if (!windows.windowA || !windows.windowB) {
        throw new Error('Failed to create windows');
      }

      await use({
        windowA: new EmptyWindow(windows.windowA),
        windowB: new EmptyWindow(windows.windowB),
      });
    } finally {
      await forceCloseAllWindowsObj(windows);
    }
  },

  twoUsersCreated: async (
    { twoEmpty, firstDisplayName, secondDisplayName },
    use
  ) => {
    const { windowA, windowB } = twoEmpty;
    const users = await Promise.all([
      windowA.createUser(firstDisplayName),
      windowB.createUser(secondDisplayName),
    ]);

    await use({
      windowA: new NewUserWindow(windowA, users[0]),
      windowB: new NewUserWindow(windowB, users[1]),
    });
  },

  twoFriends: async ({ twoUsersCreated }, use) => {
    const { windowA, windowB } = twoUsersCreated;
    await createContact(
      windowA.window.page,
      windowB.window.page,
      windowA.user,
      windowB.user
    );

    await use({
      windowA: new OneFriendWindow(windowA),
      windowB: new OneFriendWindow(windowB),
    });
  },
});
