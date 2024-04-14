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

/**
 * Opens two windows and link one to the other, logged in user is "Alice"
 * @param testName title of the test
 * @param testCallback what to run as a test
 * @returns
 */
export function sessionTestTwoLinkedWindows(
  testName: string,
  testCallback: (
    details: { alice1: Page; alice2: Page; alice: User },
    testInfo: TestInfo,
  ) => Promise<void>,
) {
  const userName = 'Alice';
  return test(testName, async ({}, testinfo) => {
    const count = 1;
    const windows = await openApp(count);

    try {
      if (windows.length !== count) {
        throw new Error(
          `openApp should have opened ${count} windows but did not.`,
        );
      }
      const alice1 = windows[0];
      const alice = await newUser(windows[0], userName);
      const alice2 = await linkedDevice(alice.recoveryPhrase);
      windows.push(alice2);
      await testCallback({ alice, alice1, alice2 }, testinfo);
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
  testCallback: (
    details: {
      alice: User;
      bob: User;
      alice1: Page;
      alice2: Page;
      bob1: Page;
    },
    testInfo: TestInfo,
  ) => Promise<void>,
) {
  const aliceName = 'Alice';
  const bobName = 'Bob';
  return test(testName, async ({}, testinfo) => {
    const count = 2;
    const windows = await openApp(count);

    try {
      if (windows.length !== count) {
        throw new Error(
          `openApp should have opened ${count} windows but did not.`,
        );
      }
      const alice1 = windows[0];
      const bob1 = windows[1];
      const [alice, bob] = await Promise.all([
        newUser(alice1, aliceName),
        newUser(bob1, bobName),
      ]);
      const alice2 = await linkedDevice(alice.recoveryPhrase);
      windows.push(alice2);

      await testCallback({ alice, alice1, alice2, bob, bob1 }, testinfo);
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
