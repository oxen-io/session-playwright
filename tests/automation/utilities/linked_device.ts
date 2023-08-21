import { logIn } from '../setup/log_in';
import { openApp } from '../setup/open';
import { checkPathLight } from './utils';

export async function linkedDevice(recoveryPhrase: string) {
  const [window] = await openApp(1); // not using sessionTest here as we need to close and reopen one of the window

  await logIn(window, recoveryPhrase);
  await checkPathLight(window);

  return [window];
}
