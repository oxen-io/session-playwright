import { sleepFor } from '../promise_utils';
import { sessionTestV2 } from './setup/sessionTestV2';
import { clickOnMatchingText, clickOnTestIdWithText } from './utilities/utils';

sessionTestV2('Voice calls', async ({ twoFriends }) => {
  const { a, b } = twoFriends;

  await clickOnTestIdWithText(a.page, 'call-button');
  await clickOnTestIdWithText(a.page, 'session-toast');
  await clickOnTestIdWithText(a.page, 'enable-calls');
  await clickOnTestIdWithText(a.page, 'session-confirm-ok-button');
  await clickOnTestIdWithText(a.page, 'message-section');
  await clickOnTestIdWithText(
    a.page,
    'module-conversation__user__profile-name',
    b.user.userName,
  );
  await clickOnTestIdWithText(a.page, 'call-button');
  // Enable calls in window B
  await clickOnTestIdWithText(b.page, 'session-toast');
  await clickOnTestIdWithText(b.page, 'enable-calls');
  await clickOnTestIdWithText(b.page, 'session-confirm-ok-button');
  await clickOnMatchingText(b.page, 'Accept');
  await sleepFor(5000);
  await clickOnTestIdWithText(a.page, 'end-call');
});


