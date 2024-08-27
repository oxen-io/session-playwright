import { Page } from '@playwright/test';

import { sleepFor } from '../promise_utils';
import { test_Alice_1W_no_network } from './setup/sessionTest';
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
    'recovery-password-seed-modal',
    recoveryPhrase,
    1000,
  );
}

test_Alice_1W_no_network('Set Password', async ({ alice, aliceWindow1 }) => {
  // Click on settings tab
  await clickOnTestIdWithText(aliceWindow1, 'settings-section');
  // Click on privacy
  await clickOnTestIdWithText(aliceWindow1, 'privacy-settings-menu-item');
  // Click set password
  await clickOnTestIdWithText(aliceWindow1, 'set-password-button');
  // Enter password
  await typeIntoInput(aliceWindow1, 'password-input', testPassword);
  // Confirm password
  await typeIntoInput(aliceWindow1, 'password-input-confirm', testPassword);
  // Click Done
  await clickOnMatchingText(aliceWindow1, 'Done');
  // Check toast notification
  await waitForTestIdWithText(
    aliceWindow1,
    'session-toast',
    'Your password has been set. Please keep it safe.',
  );
  // Click on settings tab
  await sleepFor(300, true);
  await clickOnTestIdWithText(aliceWindow1, 'settings-section');
  await clickOnTestIdWithText(
    aliceWindow1,
    'recovery-password-settings-menu-item',
  );
  await sleepFor(300, true);

  // Type password into input field and validate it
  await typeIntoInput(aliceWindow1, 'password-input', testPassword);
  // Click Done
  await clickOnMatchingText(aliceWindow1, 'Done');

  // check that the seed is visible now
  await expectRecoveryPhraseToBeVisible(aliceWindow1, alice.recoveryPassword);

  await clickOnTestIdWithText(aliceWindow1, 'settings-section');

  // Change password
  await clickOnTestIdWithText(aliceWindow1, 'change-password-settings-button');

  console.warn('clicked Change Password');
  // Enter old password
  await typeIntoInput(aliceWindow1, 'password-input', testPassword);
  // Enter new password
  await typeIntoInput(aliceWindow1, 'password-input-confirm', newTestPassword);
  // await window.keyboard.press('Tab');
  // Confirm new password
  await typeIntoInput(
    aliceWindow1,
    'password-input-reconfirm',
    newTestPassword,
  );
  // Press enter on keyboard
  await aliceWindow1.keyboard.press('Enter');
  // Check toast notification for 'changed password'
  await waitForTestIdWithText(
    aliceWindow1,
    'session-toast',
    'Your password has been changed. Please keep it safe.',
  );
});

test_Alice_1W_no_network(
  'Wrong Password',
  async ({ alice: { recoveryPassword }, aliceWindow1 }) => {
    // Check if incorrect password works
    // Click on settings tab
    await clickOnTestIdWithText(aliceWindow1, 'settings-section');
    // Click on privacy
    await clickOnMatchingText(aliceWindow1, 'Privacy');
    // Click set password
    await clickOnTestIdWithText(aliceWindow1, 'set-password-button');
    // Enter password
    await typeIntoInput(aliceWindow1, 'password-input', testPassword);
    // Confirm password
    await typeIntoInput(aliceWindow1, 'password-input-confirm', testPassword);
    // Click Done
    await clickOnMatchingText(aliceWindow1, 'Done');
    // Click on recovery phrase tab
    await sleepFor(100);

    // Click on settings tab
    await clickOnTestIdWithText(aliceWindow1, 'settings-section');
    await clickOnTestIdWithText(
      aliceWindow1,
      'recovery-password-settings-menu-item',
    );
    // Type password into input field
    await typeIntoInput(aliceWindow1, 'password-input', testPassword);
    // Confirm the password
    await clickOnTestIdWithText(aliceWindow1, 'session-confirm-ok-button');
    // this should print the recovery phrase
    await expectRecoveryPhraseToBeVisible(aliceWindow1, recoveryPassword);

    // move away from the settings tab (otherwise the settings doesn't lock right away)
    await clickOnTestIdWithText(aliceWindow1, 'message-section');

    //  Click on settings tab
    await clickOnTestIdWithText(aliceWindow1, 'settings-section');
    await sleepFor(500);
    // Click on recovery phrase tab
    await clickOnTestIdWithText(
      aliceWindow1,
      'recovery-password-settings-menu-item',
    );
    // Try with incorrect password
    await typeIntoInput(aliceWindow1, 'password-input', newTestPassword);
    // Confirm the password
    await clickOnTestIdWithText(aliceWindow1, 'session-confirm-ok-button');
    // this should NOT print the recovery phrase

    await hasElementPoppedUpThatShouldnt(
      aliceWindow1,
      'data-testid',
      'recovery-password-seed-modal',
      recoveryPassword,
    );

    //  invalid password banner showing?
    await waitForTestIdWithText(
      aliceWindow1,
      'session-toast',
      'Invalid password',
    );
    await clickOnTestIdWithText(aliceWindow1, 'modal-close-button');
    await sleepFor(100);
    // Click on recovery phrase tab
    await clickOnTestIdWithText(
      aliceWindow1,
      'recovery-password-settings-menu-item',
    );
    //  No password entered
    await clickOnMatchingText(aliceWindow1, 'Done');
    //  Banner should ask for password to be entered
    await waitForTestIdWithText(
      aliceWindow1,
      'session-toast',
      'Please enter your password',
    );
  },
);
