import { Page } from '@playwright/test';

import { sleepFor } from '../promise_utils';
import { test_Alice1_no_network } from './setup/sessionTest';
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

test_Alice1_no_network('Set Password', async ({ alice, alice1 }) => {
  // Click on settings tab
  await clickOnTestIdWithText(alice1, 'settings-section');
  // Click on privacy
  await clickOnTestIdWithText(alice1, 'privacy-settings-menu-item');
  // Click set password
  await clickOnTestIdWithText(alice1, 'set-password-button');
  // Enter password
  await typeIntoInput(alice1, 'password-input', testPassword);
  // Confirm password
  await typeIntoInput(alice1, 'password-input-confirm', testPassword);
  // Click Done
  await clickOnMatchingText(alice1, 'Done');
  // Check toast notification
  await waitForTestIdWithText(
    alice1,
    'session-toast',
    'Your password has been set. Please keep it safe.',
  );
  // Click on settings tab
  await sleepFor(300, true);
  await clickOnTestIdWithText(alice1, 'settings-section');
  await clickOnTestIdWithText(alice1, 'recovery-phrase-settings-menu-item');
  await sleepFor(300, true);

  // Type password into input field and validate it
  await typeIntoInput(alice1, 'password-input', testPassword);
  // Click Done
  await clickOnMatchingText(alice1, 'Done');

  // check that the seed is visible now
  await expectRecoveryPhraseToBeVisible(alice1, alice.recoveryPhrase);

  // copy the seed phrase to the clipboard, also closes the dialog
  await clickOnMatchingText(alice1, 'Copy');
  // Note: I did not find a way to get the clipboard content from the page/window/nodeJS for now.

  await clickOnTestIdWithText(alice1, 'settings-section');

  // Change password
  await clickOnTestIdWithText(alice1, 'change-password-settings-button');

  console.warn('clicked Change Password');
  // Enter old password
  await typeIntoInput(alice1, 'password-input', testPassword);
  // Enter new password
  await typeIntoInput(alice1, 'password-input-confirm', newTestPassword);
  // await window.keyboard.press('Tab');
  // Confirm new password
  await typeIntoInput(alice1, 'password-input-reconfirm', newTestPassword);
  // Press enter on keyboard
  await alice1.keyboard.press('Enter');
  // Check toast notification for 'changed password'
  await waitForTestIdWithText(
    alice1,
    'session-toast',
    'Your password has been changed. Please keep it safe.',
  );
});

test_Alice1_no_network(
  'Wrong Password',
  async ({ alice: { recoveryPhrase }, alice1 }) => {
    // Check if incorrect password works
    // Click on settings tab
    await clickOnTestIdWithText(alice1, 'settings-section');
    // Click on privacy
    await clickOnMatchingText(alice1, 'Privacy');
    // Click set password
    await clickOnTestIdWithText(alice1, 'set-password-button');
    // Enter password
    await typeIntoInput(alice1, 'password-input', testPassword);
    // Confirm password
    await typeIntoInput(alice1, 'password-input-confirm', testPassword);
    // Click Done
    await clickOnMatchingText(alice1, 'Done');
    // Click on recovery phrase tab
    await sleepFor(100);

    // Click on settings tab
    await clickOnTestIdWithText(alice1, 'settings-section');
    await clickOnTestIdWithText(alice1, 'recovery-phrase-settings-menu-item');
    // Type password into input field
    await typeIntoInput(alice1, 'password-input', testPassword);
    // Confirm the password
    await clickOnTestIdWithText(alice1, 'session-confirm-ok-button');
    // this should print the recovery phrase
    await expectRecoveryPhraseToBeVisible(alice1, recoveryPhrase);

    // copy the seed phrase to the clipboard, also closes the dialog
    await clickOnMatchingText(alice1, 'Copy');

    //  Click on settings tab
    await clickOnTestIdWithText(alice1, 'settings-section');
    await sleepFor(500);
    // Click on recovery phrase tab
    await clickOnTestIdWithText(alice1, 'recovery-phrase-settings-menu-item');
    // Try with incorrect password
    await typeIntoInput(alice1, 'password-input', '000000');
    // Confirm the password
    await clickOnTestIdWithText(alice1, 'session-confirm-ok-button');
    // this should NOT print the recovery phrase

    await sleepFor(100);
    await hasElementPoppedUpThatShouldnt(
      alice1,
      'data-testid',
      'recovery-phrase-seed-modal',
      recoveryPhrase,
    );

    //  invalid password banner showing?
    await waitForTestIdWithText(alice1, 'session-toast', 'Invalid password');
    await clickOnTestIdWithText(alice1, 'modal-close-button');
    await sleepFor(100);
    // Click on recovery phrase tab
    await clickOnTestIdWithText(alice1, 'recovery-phrase-settings-menu-item');
    //  No password entered
    await clickOnMatchingText(alice1, 'Done');
    //  Banner should ask for password to be entered
    await waitForTestIdWithText(
      alice1,
      'session-toast',
      'Please enter your password',
    );
  },
);
