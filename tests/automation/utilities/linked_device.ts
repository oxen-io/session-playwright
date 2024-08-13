import { openApp } from '../setup/open';
import { recoverFromSeed } from '../setup/recovery_using_seed';
import { checkPathLight } from './utils';

export async function linkedDevice(recoveryPhrase: string) {
  const [window] = await openApp(1); // not using sessionTest here as we need to close and reopen one of the window

  await recoverFromSeed(window, recoveryPhrase);
  await checkPathLight(window);

  return window;
}
