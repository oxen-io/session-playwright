import { sessionTestOneWindow } from './setup/sessionTest';
import { clickOnTestIdWithText } from './utilities/utils';

sessionTestOneWindow('Tiny test', async ([windowA]) => {
  await clickOnTestIdWithText(windowA, 'create-account-button');
});
