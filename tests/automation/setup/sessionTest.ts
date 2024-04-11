/* eslint-disable no-empty-pattern */
/* eslint-disable @typescript-eslint/array-type */
import { Page, TestInfo, test } from '@playwright/test';
import { User } from '../types/testing';
import { linkedDevice } from '../utilities/linked_device';
import { forceCloseAllWindows } from './beforeEach';
import { newUser } from './new_user';
import { openApp } from './open';

// This is not ideal, most of our test needs to open a specific number of windows and close them once the test is done or failed.
// This file contains a bunch of utility function to use to open those windows and clean them afterwards.
// Note: those function only keep track (and close) the windows they open. If you open a new window or need to close and reopen an existing one, this won't take of it.

type Tuple<T, N extends number> = N extends N
  ? number extends N
    ? T[]
    : _TupleOf<T, N, []>
  : never;
type _TupleOf<T, N extends number, R extends unknown[]> = R['length'] extends N
  ? R
  : _TupleOf<T, N, [T, ...R]>;

type CountWindows = 1 | 2 | 3 | 4 | 5;

function sessionTest<T extends CountWindows, N extends Tuple<Page, T>>(
  testName: string,
  testCallback: (windows: N, testInfo: TestInfo) => Promise<void>,
  count: T,
) {
  return test(testName, async ({}, testinfo) => {
    const windows = await openApp(count);

    try {
      if (windows.length !== count) {
        throw new Error(
          `openApp should have opened ${count} windows but did not.`,
        );
      }
      await testCallback(windows as N, testinfo);
    } catch (e) {
      throw e;
    } finally {
      try {
        await forceCloseAllWindows(windows);
      } catch (e) {
        console.error(`forceCloseAllWindows of ${testName} failed with: `, e);
      }
    }
  });
}

export function sessionTestOneWindow(
  testName: string,
  testCallback: (windows: Tuple<Page, 1>, testInfo: TestInfo) => Promise<void>,
) {
  return sessionTest(testName, testCallback, 1);
}

export function sessionTestTwoWindows(
  testName: string,
  testCallback: ([windowA, windowB]: [Page, Page]) => Promise<void>,
) {
  return sessionTest(testName, testCallback, 2);
}

export function sessionTestThreeWindows(
  testName: string,
  testCallback: ([windowA, windowB, windowC]: [
    Page,
    Page,
    Page,
  ]) => Promise<void>,
) {
  return sessionTest(testName, testCallback, 3);
}

export function sessionTestFourWindows(
  testName: string,
  testCallback: ([windowA, windowB, windowC, windowD]: [
    Page,
    Page,
    Page,
    Page,
  ]) => Promise<void>,
) {
  return sessionTest(testName, testCallback, 4);
}

export function sessionTestFiveWindows(
  testName: string,
  testCallback: ([windowA, windowB, windowC, windowD]: [
    Page,
    Page,
    Page,
    Page,
    Page,
  ]) => Promise<void>,
) {
  return sessionTest(testName, testCallback, 5);
}

/**
 * fixtures with linked windows are below
 */

export function sessionTestTwoLinkedWindows(
  testName: string,
  userName: string,
  testCallback: (
    windows: Tuple<Page, 2>,
    user: User,
    testInfo: TestInfo,
  ) => Promise<void>,
) {
  return test(testName, async ({}, testinfo) => {
    const count = 1;
    const windows = await openApp(count);

    try {
      if (windows.length !== count) {
        throw new Error(
          `openApp should have opened ${count} windows but did not.`,
        );
      }
      const mainPage = windows[0];
      const createdUser = await newUser(windows[0], userName);
      const linkedPage = await linkedDevice(createdUser.recoveryPhrase);
      windows.push(linkedPage);
      await testCallback([mainPage, linkedPage], createdUser, testinfo);
      // eslint-disable-next-line no-useless-catch
    } catch (e) {
      throw e;
    } finally {
      try {
        await forceCloseAllWindows(windows);
      } catch (e) {
        console.error(`forceCloseAllWindows of ${testName} failed with: `, e);
      }
    }
  });
}

export function sessionTestThreeWindowsWithTwoLinked(
  testName: string,
  userNames: Tuple<string, 2>,
  testCallback: (
    windows: { windowsLinked: Tuple<Page, 2>; otherWindow: Page },
    users: { userLinked: User; otherUser: User },
    testInfo: TestInfo,
  ) => Promise<void>,
) {
  return test(testName, async ({}, testinfo) => {
    const count = 2;
    const windows = await openApp(count);

    try {
      if (windows.length !== count) {
        throw new Error(
          `openApp should have opened ${count} windows but did not.`,
        );
      }
      const mainPage1 = windows[0];
      const mainPage2 = windows[1];
      const [userLinked, otherUser] = await Promise.all([
        newUser(mainPage1, userNames[0]),
        newUser(mainPage2, userNames[1]),
      ]);
      const linkedPage = await linkedDevice(userLinked.recoveryPhrase);
      windows.push(linkedPage);

      await testCallback(
        { windowsLinked: [mainPage1, linkedPage], otherWindow: mainPage2 },
        { userLinked, otherUser },
        testinfo,
      );
    } catch (e) {
      throw e;
    } finally {
      try {
        await forceCloseAllWindows(windows);
      } catch (e) {
        console.error(`forceCloseAllWindows of ${testName} failed with: `, e);
      }
    }
  });
}
