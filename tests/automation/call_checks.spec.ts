import { sleepFor } from '../promise_utils';
import { test_Alice_1W_Bob_1W } from './setup/sessionTest';
import { createContact } from './utilities/create_contact';
import { clickOnMatchingText, clickOnTestIdWithText } from './utilities/utils';

test_Alice_1W_Bob_1W(
  'Voice calls',
  async ({ alice, aliceWindow1, bob, bobWindow1 }) => {
    await createContact(aliceWindow1, bobWindow1, alice, bob);
    await clickOnTestIdWithText(aliceWindow1, 'call-button');
    await clickOnTestIdWithText(aliceWindow1, 'session-toast');
    await clickOnTestIdWithText(aliceWindow1, 'enable-calls');
    await clickOnTestIdWithText(aliceWindow1, 'session-confirm-ok-button');
    await clickOnTestIdWithText(aliceWindow1, 'message-section');
    await clickOnTestIdWithText(
      aliceWindow1,
      'module-conversation__user__profile-name',
      bob.userName,
    );
    await clickOnTestIdWithText(aliceWindow1, 'call-button');
    // Enable calls in window B
    await clickOnTestIdWithText(bobWindow1, 'session-toast');
    await clickOnTestIdWithText(bobWindow1, 'enable-calls');
    await clickOnTestIdWithText(bobWindow1, 'session-confirm-ok-button');
    await clickOnMatchingText(bobWindow1, 'Accept');
    await sleepFor(5000);
    await clickOnTestIdWithText(aliceWindow1, 'end-call');
  },
);
