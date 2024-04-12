TODO

- make actions/lookups/waitfor/clicks class-based

* - add a comment to actions, to be able to have a meaning for each actions in addition to what the action is.

- add a sessionTest which doesn't need to wait on network
- make the maxWait explicit, and use sane/safe values (except for send/receive messages, which are always going to take extra long)
- make a fixture making two friends faster (not waiting on message received from both side to send one)
- make a fixture with 2 devices, one linked, without recovery from seed
- make other fixtures to share the shared usages more
- merge appium + playwright repository
- make linkedDevice have an bool to use the recoveyr phrase without a displayName and use it everywhere except for the real "link a device" test
- use and add more of the `type WithRightButton`
- find a way to sort the `export type DataTestId =`
