/* eslint-disable no-empty-pattern */
/* eslint-disable @typescript-eslint/array-type */
import { Page, TestInfo, test } from '@playwright/test';
import { Group, User } from '../types/testing';
import { linkedDevice } from '../utilities/linked_device';
import { forceCloseAllWindows } from './beforeEach';
import { createGroup } from './create_group';
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

type WithAlice = { alice: User };
type WithBob = { bob: User };
type WithCharlie = { charlie: User };
type WithDracula = { dracula: User };

type WithAlice1 = { alice1: Page };
type WithAlice2 = { alice2: Page };
type WithBob1 = { bob1: Page };
type WithCharlie1 = { charlie1: Page };
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type WithDracula1 = { dracula1: Page };

type WithGroupCreated = { groupCreated: Group };

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

/**
 * This type can cause type checking performance issues, so only use it with small values
 */
type LessThan<
  TNumber extends number,
  TArray extends any[] = [],
> = TNumber extends TArray['length']
  ? TArray[number]
  : LessThan<TNumber, [...TArray, TArray['length']]>;

/**
 * This type can cause type checking performance issues, so only use it with small values.
 */
type NumericRange<TStart extends number, TEnd extends number> =
  | Exclude<TEnd, LessThan<TStart, []>>
  | Exclude<LessThan<TEnd, []>, LessThan<TStart, []>>;

function sessionTestGeneric<
  UserCount extends 1 | 2 | 3 | 4,
  Links extends Array<NumericRange<1, UserCount>>,
  Grouped extends Array<NumericRange<1, UserCount>>,
>(
  testName: string,
  userCount: UserCount,
  { links, grouped }: { links?: Links; grouped?: Grouped },
  testCallback: (
    details: {
      users: Tuple<User, UserCount>;
      groupCreated: Grouped extends Array<any> ? Group : undefined;
      mainWindows: Tuple<Page, UserCount>;
      linkedWindows: Tuple<Page, Links['length']>;
    },
    testInfo: TestInfo,
  ) => Promise<void>,
) {
  const userNames: Tuple<string, 4> = ['Alice', 'Bob', 'Charlie', 'Dracula'];

  return test(testName, async ({}, testinfo) => {
    const mainWindows = await openApp(userCount);
    const linkedWindows: Array<Page> = [];

    try {
      if (mainWindows.length !== userCount) {
        throw new Error(
          `openApp should have opened ${userCount} windows but did not.`,
        );
      }
      const users = (await Promise.all(
        mainWindows.map((m, i) => newUser(m, userNames[i])),
      )) as Tuple<User, UserCount>;

      if (links?.length) {
        for (let index = 0; index < links.length; index++) {
          const link = links[index];
          console.info(
            'linking a window with ',
            users[link - 1].recoveryPhrase,
          );
          const linked = await linkedDevice(users[link - 1].recoveryPhrase);
          linkedWindows.push(linked);
        }
      }

      let groupCreated: Group | undefined;
      if (grouped?.length) {
        groupCreated = await createGroup(
          testName,
          users[grouped[0] - 1],
          mainWindows[grouped[0] - 1],
          users[grouped[1] - 1],
          mainWindows[grouped[1] - 1],
          users[grouped[2] - 1],
          mainWindows[grouped[2] - 1],
        );
      }

      // Sadly, we need to cast the parameters here, so our less generic function have correct types for the callback
      await testCallback(
        {
          mainWindows: mainWindows as Tuple<Page, UserCount>,
          linkedWindows: linkedWindows as Tuple<Page, Links['length']>,
          users,
          groupCreated: groupCreated as Grouped extends Array<any>
            ? Group
            : undefined,
        },
        testinfo,
      );
    } catch (e) {
      throw e;
    } finally {
      try {
        await forceCloseAllWindows([...mainWindows, ...linkedWindows]);
      } catch (e) {
        console.error(`forceCloseAllWindows of ${testName} failed with: `, e);
      }
    }
  });
}

export function test_Alice2(
  testname: string,
  testCallback: (
    details: WithAlice & WithAlice1 & WithAlice2,
    testInfo: TestInfo,
  ) => Promise<void>,
) {
  return sessionTestGeneric(
    testname,
    1,
    { links: [1] },
    ({ mainWindows, users, linkedWindows }, testInfo) => {
      return testCallback(
        {
          alice: users[0],
          alice1: mainWindows[0],
          alice2: linkedWindows[0],
        },
        testInfo,
      );
    },
  );
}

export function test_Alice2_Bob1(
  testname: string,
  testCallback: (
    details: WithAlice & WithAlice1 & WithAlice2 & WithBob & WithBob1,
    testInfo: TestInfo,
  ) => Promise<void>,
) {
  return sessionTestGeneric(
    testname,
    2,
    { links: [1] },
    ({ mainWindows, users, linkedWindows }, testInfo) => {
      return testCallback(
        {
          alice: users[0],
          bob: users[1],
          alice1: mainWindows[0],
          bob1: mainWindows[1],
          alice2: linkedWindows[0],
        },
        testInfo,
      );
    },
  );
}

export function test_group_Alice1_Bob1_Charlie1(
  testname: string,
  testCallback: (
    details: WithAlice &
      WithAlice1 &
      WithBob &
      WithBob1 &
      WithCharlie &
      WithCharlie1 &
      WithGroupCreated,
    testInfo: TestInfo,
  ) => Promise<void>,
) {
  return sessionTestGeneric(
    testname,
    3,
    { grouped: [1, 2, 3] },
    ({ mainWindows, users, groupCreated }, testInfo) => {
      return testCallback(
        {
          alice: users[0],
          bob: users[1],
          charlie: users[2],
          alice1: mainWindows[0],
          bob1: mainWindows[1],
          charlie1: mainWindows[2],
          groupCreated,
        },
        testInfo,
      );
    },
  );
}

export function test_group_Alice2_Bob1_Charlie1(
  testname: string,
  testCallback: (
    details: WithAlice &
      WithAlice1 &
      WithAlice2 &
      WithBob &
      WithBob1 &
      WithCharlie &
      WithCharlie1 &
      WithGroupCreated,
    testInfo: TestInfo,
  ) => Promise<void>,
) {
  return sessionTestGeneric(
    testname,
    3,
    { grouped: [1, 2, 3], links: [1] },
    ({ mainWindows, users, groupCreated, linkedWindows }, testInfo) => {
      return testCallback(
        {
          alice: users[0],
          bob: users[1],
          charlie: users[2],
          alice1: mainWindows[0],
          bob1: mainWindows[1],
          charlie1: mainWindows[2],
          alice2: linkedWindows[0],
          groupCreated,
        },
        testInfo,
      );
    },
  );
}

export function test_group_Alice1_Bob1_Charlie1_Dracula1(
  testname: string,
  testCallback: (
    details: WithAlice &
      WithAlice1 &
      WithBob &
      WithBob1 &
      WithCharlie &
      WithCharlie1 &
      WithDracula &
      WithDracula1 &
      WithGroupCreated,

    testInfo: TestInfo,
  ) => Promise<void>,
) {
  return sessionTestGeneric(
    testname,
    4,
    { grouped: [1, 2, 3] },
    ({ mainWindows, users, groupCreated }, testInfo) => {
      return testCallback(
        {
          alice: users[0],
          bob: users[1],
          charlie: users[2],
          dracula: users[3],
          alice1: mainWindows[0],
          bob1: mainWindows[1],
          charlie1: mainWindows[2],
          dracula1: mainWindows[3],
          groupCreated,
        },
        testInfo,
      );
    },
  );
}
