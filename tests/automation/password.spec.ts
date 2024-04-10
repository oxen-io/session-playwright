import { Page } from '@playwright/test';

import { sleepFor } from '../promise_utils';
import { newUser } from './setup/new_user';
import { sessionTestOneWindow } from './setup/sessionTest';
import {
  clickOnMatchingText,
  clickOnTestIdWithText,
  hasElementPoppedUpThatShouldnt,
  typeIntoInput,
  waitForTestIdWithText,
} from './utilities/utils';

const testPassword = '123456';
const newTestPassword = '789101112';

async function expectRecoveryPhraseToBeVisible(
  window: Page,
  recoveryPhrase: string,
) {
  await waitForTestIdWithText(
    window,
    'recovery-phrase-seed-modal',
    recoveryPhrase,
    1000,
  );
}

sessionTestOneWindow('Set Password', async ([window]) => {
  // Create user
  const { recoveryPhrase } = await newUser(window, 'Alice', false);
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
  await sleepFor(300, true);
  await clickOnTestIdWithText(window, 'settings-section');
  await clickOnTestIdWithText(window, 'recovery-phrase-settings-menu-item');
  await sleepFor(300, true);

  // Type password into input field and validate it
  await typeIntoInput(window, 'password-input', testPassword);
  // Click Done
  await clickOnMatchingText(window, 'Done');

  // check that the seed is visible now
  await expectRecoveryPhraseToBeVisible(window, recoveryPhrase);

  // copy the seed phrase to the clipboard, also closes the dialog
  await clickOnMatchingText(window, 'Copy');
  // Note: I did not find a way to get the clipboard content from the page/window/nodeJS for now.

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
  const { recoveryPhrase } = await newUser(window, 'Alice', false);
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

  // Click on settings tab
  await clickOnTestIdWithText(window, 'settings-section');
  await clickOnTestIdWithText(window, 'recovery-phrase-settings-menu-item');
  // Type password into input field
  await typeIntoInput(window, 'password-input', testPassword);
  // Confirm the password
  await clickOnTestIdWithText(window, 'session-confirm-ok-button');
  // this should print the recovery phrase
  await expectRecoveryPhraseToBeVisible(window, recoveryPhrase);

  // copy the seed phrase to the clipboard, also closes the dialog
  await clickOnMatchingText(window, 'Copy');

  //  Click on settings tab
  await clickOnTestIdWithText(window, 'settings-section');
  await sleepFor(500);
  // Click on recovery phrase tab
  await clickOnTestIdWithText(window, 'recovery-phrase-settings-menu-item');
  // Try with incorrect password
  await typeIntoInput(window, 'password-input', '000000');
  // Confirm the password
  await clickOnTestIdWithText(window, 'session-confirm-ok-button');
  // this should NOT print the recovery phrase

  await sleepFor(100);
  await hasElementPoppedUpThatShouldnt(
    window,
    'data-testid',
    'recovery-phrase-seed-modal',
    recoveryPhrase,
  );

  //  invalid password banner showing?
  await waitForTestIdWithText(window, 'session-toast', 'Invalid password');
  await clickOnTestIdWithText(window, 'modal-close-button');
  await sleepFor(100);
  // Click on recovery phrase tab
  await clickOnTestIdWithText(window, 'recovery-phrase-settings-menu-item');
  //  No password entered
  await clickOnMatchingText(window, 'Done');
  //  Banner should ask for password to be entered
  await waitForTestIdWithText(
    window,
    'session-toast',
    'Please enter your password',
  );
});
