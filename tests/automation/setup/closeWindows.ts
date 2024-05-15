import { Page } from '@playwright/test';
import { sleepFor } from '../../promise_utils';

export const forceCloseAllWindows = async (windows: Array<Page>) => {
  return Promise.race([
    Promise.all(windows.map((w) => w.close())),
    async () => sleepFor(4000),
  ]);
};
