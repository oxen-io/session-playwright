import { Page } from '@playwright/test';
import { readdirSync, rmdirSync } from 'fs-extra';
import { homedir } from 'os';
import { join } from 'path';
import { isLinux, isMacOS } from '../../os_utils';
import { sleepFor } from '../../promise_utils';
import { MULTI_PREFIX, NODE_ENV } from './open';

const getDirectoriesOfSessionDataPath = (source: string) =>
  readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => {
      return dirent.name;
    })
    .filter((n) => n.includes(`${NODE_ENV}-${MULTI_PREFIX}`));

const alreadyCleaned = false;
let alreadyCleanedWaiting = false;

export function cleanUpOtherTest() {
  if (alreadyCleaned || alreadyCleanedWaiting) {
    return;
  }

  alreadyCleanedWaiting = true;
  if (process.env.CI) {
    console.info(
      'We are on CI, no need to clean up other tests (so we can run them in parallel)',
    );

    return;
  }

  try {
    const parentFolderOfAllDataPath = isMacOS()
      ? join(homedir(), 'Library', 'Application Support')
      : isLinux()
      ? join(homedir(), '.config')
      : null;
    if (!parentFolderOfAllDataPath) {
      throw new Error('Only macOS is currrently supported ');
    }

    if (!parentFolderOfAllDataPath || parentFolderOfAllDataPath.length < 9) {
      throw new Error(
        `parentFolderOfAllDataPath not found or invalid: ${parentFolderOfAllDataPath}`,
      );
    }
    console.info(
      'cleaning other tests leftovers...',
      parentFolderOfAllDataPath,
    );

    const allAppDataPath = getDirectoriesOfSessionDataPath(
      parentFolderOfAllDataPath,
    );
    console.info('allAppDataPath to clean', allAppDataPath);

    allAppDataPath.forEach((folder) => {
      const pathToRemove = join(parentFolderOfAllDataPath, folder);
      rmdirSync(pathToRemove, { recursive: true });
    });
    console.info('...done');
  } catch (e) {
    console.error(`failed to cleanup old files: ${e.message}`);
  }
}

export const forceCloseAllWindows = async (windows: Array<Page>) => {
  return Promise.race([
    Promise.all(windows.map((w) => w.close())),
    async () => sleepFor(4000),
  ]);
};
