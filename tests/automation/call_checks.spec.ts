import { sleepFor } from '../promise_utils';
import { test_Alice1_Bob1 } from './setup/sessionTest';
import { createContact } from './utilities/create_contact';
import { clickOnMatchingText, clickOnTestIdWithText } from './utilities/utils';

test_Alice1_Bob1('Voice calls', async ({ alice, alice1, bob, bob1 }) => {
  await createContact(alice1, bob1, alice, bob);
  await clickOnTestIdWithText(alice1, 'call-button');
  await clickOnTestIdWithText(alice1, 'session-toast');
  await clickOnTestIdWithText(alice1, 'enable-calls');
  await clickOnTestIdWithText(alice1, 'session-confirm-ok-button');
  await clickOnTestIdWithText(alice1, 'message-section');
  await clickOnTestIdWithText(
    alice1,
    'module-conversation__user__profile-name',
    bob.userName,
  );
  await clickOnTestIdWithText(alice1, 'call-button');
  // Enable calls in window B
  await clickOnTestIdWithText(bob1, 'session-toast');
  await clickOnTestIdWithText(bob1, 'enable-calls');
  await clickOnTestIdWithText(bob1, 'session-confirm-ok-button');
  await clickOnMatchingText(bob1, 'Accept');
  await sleepFor(5000);
  await clickOnTestIdWithText(alice1, 'end-call');
});
