import { cleanUpOtherTest } from './tests/automation/setup/beforeEach';

export default async function cleanupPreviousTests() {
  console.log('Cleaning up all previous tests configs...');
  await cleanUpOtherTest();
  console.log('Cleaning up done.');
}
