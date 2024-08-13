import { sleepFor } from '../promise_utils';
import { newUser } from './setup/new_user';
import { sessionTestOneWindow } from './setup/sessionTest';
import {
  clickOnTestIdWithText,
  waitForTestIdWithText,
} from './utilities/utils';

sessionTestOneWindow('Create User', async ([window]) => {
  // Create User
  const userA = await newUser(window, 'Alice', false);
  // Open profile tab
  await clickOnTestIdWithText(window, 'leftpane-primary-avatar');
  await sleepFor(100, true);
  // check username matches
  await waitForTestIdWithText(window, 'your-profile-name', userA.userName);
  // check session id matches
  await waitForTestIdWithText(window, 'your-session-id', userA.accountid);
  // exit profile modal
  await clickOnTestIdWithText(window, 'modal-close-button');
  // go to settings section
  await clickOnTestIdWithText(window, 'settings-section');
  // check recovery phrase matches
  await clickOnTestIdWithText(window, 'recovery-password-settings-menu-item');
  await waitForTestIdWithText(
    window,
    'recovery-password-seed-modal',
    userA.recoveryPassword,
  );
});
