import { cleanUpOtherTest } from './tests/automation/setup/beforeEach';

export default function cleanupPreviousTests() {
  console.log('Cleaning up all previous tests configs...');
  cleanUpOtherTest();
  console.log('Cleaning up done.');
}
