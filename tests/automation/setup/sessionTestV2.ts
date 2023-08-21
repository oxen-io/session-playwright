/* eslint-disable no-useless-catch */
/* eslint-disable no-empty-pattern */
/* eslint-disable @typescript-eslint/array-type  */

import { Page, test } from '@playwright/test';
import {
  OpenWindowsType,
  beforeAllClean,
  forceCloseAllWindows,
  forceCloseAllWindowsObj,
} from './beforeEach';

import { openApp } from './open';
import { createContact } from '../utilities/create_contact';
import { User } from '../types/testing';
import { newUser } from './new_user';

type PageAndUser = {
  page: Page;
  user: User
}

type SessionFixtures = {
  oneEmpty: { page: Page };
  twoEmpty: { page1: Page; page2: Page };
  userCreated: PageAndUser;
  twoUsersCreated: {
    a: PageAndUser,
    b: PageAndUser,
  };
  twoFriends: {
    a: PageAndUser,
    b: PageAndUser,
  };
};

async function openWindows<T extends 1 | 2 | 3 | 4 | 5>(
  count: T,
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

      await use({ page: windows.windowA });
    } finally {
      await forceCloseAllWindowsObj(windows);
    }
  },
  userCreated: async ({ oneEmpty, firstDisplayName }, use) => {
    const user = await newUser(oneEmpty.page, firstDisplayName)
    try {
      await use({ page: oneEmpty.page, user });
    } finally {
      await forceCloseAllWindows([oneEmpty.page]);
    }
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
        page1: windows.windowA,
        page2: windows.windowB,
      });
    } finally {
      await forceCloseAllWindowsObj(windows);
    }
  },

  twoUsersCreated: async (
    { twoEmpty, firstDisplayName, secondDisplayName },
    use,
  ) => {
    const { page1, page2 } = twoEmpty;
    try {
      const users = await Promise.all([
        newUser(page1, firstDisplayName),
        newUser(page2, secondDisplayName),
      ]);

      await use({
        a: {page: page1, user: users[0]},
        b: {page: page2, user: users[1]},
      });
    } finally {
      await forceCloseAllWindows([page1, page2]);
    }
  },

  twoFriends: async ({ twoUsersCreated }, use) => {
    const { a, b } = twoUsersCreated;
    try {

      await createContact(
        a.page,
        b.page,
        a.user,
        b.user,
      );

      await use({
        a,
        b,
      });
  } finally {
    await forceCloseAllWindows([a.page, b.page]);
  }
  },
});
