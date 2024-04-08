import { sleepFor } from '../promise_utils';
import { newUser } from './setup/new_user';
import { sessionTestOneWindow } from './setup/sessionTest';
import {
  clickOnMatchingText,
  clickOnTestIdWithText,
  typeIntoInput,
  waitForMatchingText,
  waitForTestIdWithText,
} from './utilities/utils';

const testPassword = '123456';
const newTestPassword = '789101112';

sessionTestOneWindow('Set Password', async ([window]) => {
  // Create user
  await newUser(window, 'Alice');
  // Click on settings tab
  await clickOnTestIdWithText(window, 'settings-section');
  // Click on privacy
  await clickOnTestIdWithText(window, 'privacy-settings-menu-item');
  // Click set password
  await clickOnTestIdWithText(window, 'set-password-button');
  // Enter password
  await typeIntoInput(window, 'password-input', testPassword);
  // Confirm password
  await typeIntoInput(window, 'password-input-confirm', testPassword);
  // Click Done
  await clickOnMatchingText(window, 'Done');
  // Check toast notification
  await waitForTestIdWithText(
    window,
    'session-toast',
    'Your password has been set. Please keep it safe.',
  );
  // Click on settings tab
  await sleepFor(300);
  await clickOnTestIdWithText(window, 'settings-section');
  await clickOnTestIdWithText(window, 'recovery-phrase-settings-menu-item');
  // Type password into input field
  await typeIntoInput(window, 'password-input', testPassword);
  // Click Done
  await clickOnMatchingText(window, 'Done');
  await clickOnTestIdWithText(window, 'settings-section');

  // Change password
  await clickOnTestIdWithText(window, 'change-password-settings-button');

  console.warn('clicked Change Password');
  // Enter old password
  await typeIntoInput(window, 'password-input', testPassword);
  // Enter new password
  await typeIntoInput(window, 'password-input-confirm', newTestPassword);
  // await window.keyboard.press('Tab');
  // Confirm new password
  await typeIntoInput(window, 'password-input-reconfirm', newTestPassword);
  // Press enter on keyboard
  await window.keyboard.press('Enter');
  // Check toast notification for 'changed password'
  await waitForTestIdWithText(
    window,
    'session-toast',
    'Your password has been changed. Please keep it safe.',
  );
});

sessionTestOneWindow('Wrong password', async ([window]) => {
  // Check if incorrect password works
  // Create user
  await newUser(window, 'Alice');
  // Click on settings tab
  await clickOnTestIdWithText(window, 'settings-section');
  // Click on privacy
  await clickOnMatchingText(window, 'Privacy');
  // Click set password
  await clickOnTestIdWithText(window, 'set-password-button');
  // Enter password
  await typeIntoInput(window, 'password-input', testPassword);
  // Confirm password
  await typeIntoInput(window, 'password-input-confirm', testPassword);
  // Click Done
  await clickOnMatchingText(window, 'Done');
  // Click on recovery phrase tab
  await sleepFor(100);
  await clickOnTestIdWithText(window, 'recovery-phrase-settings-menu-item');
  // Type password into input field
  await typeIntoInput(window, 'password-input', testPassword);
  // Click Done
  await clickOnTestIdWithText(window, 'session-confirm-ok-button');
  // // Click on settings tab
  await sleepFor(500);
  // Click on recovery phrase tab
  await clickOnTestIdWithText(window, 'recovery-phrase-settings-menu-item');
  // // Try with incorrect password
  await typeIntoInput(window, 'password-input', '000000');
  // Confirm
  await clickOnMatchingText(window, 'Done');
  // // invalid password banner showing?
  await waitForTestIdWithText(window, 'session-toast', 'Invalid password');
  await clickOnTestIdWithText(window, 'modal-close-button');
  await sleepFor(100);
  // Click on recovery phrase tab
  await clickOnTestIdWithText(window, 'recovery-phrase-settings-menu-item');
  // // No password entered
  await clickOnMatchingText(window, 'Done');
  // // Banner should ask for password to be entered
  await waitForTestIdWithText(
    window,
    'session-toast',
    'Please enter your password',
  );
});
