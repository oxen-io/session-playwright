// local playwright_shard(shard_number) = {
//   kind: 'pipeline',
//   type: 'docker',
//   name: 'session-integration-tests-' + shard_number,
//   platform: { arch: 'amd64' },
//   // depends_on: ['restore-cache'],
//   steps: [

//     {
//       name: 'playwright tests',
//       image: 'registry.oxen.rocks/lokinet-ci-playwrightv1.37.0-jammy',
//       # pull: 'always',
//       environment: {
//         'NVM_DIR': '/usr/local/nvm',
//         'NODE_VERSION': '18.15.0',
//         'SESSION_DESKTOP_ROOT': '/root/session-desktop',
//         'NODE_PATH': '$NVM_DIR/v$NODE_VERSION/lib/node_modules',
//         'SESSION_BRANCH': 'unstable',
//         'PLAYWRIGHT_RETRIES_COUNT': '0',
//         'PLAYWRIGHT_WORKER_COUNT': '1',
//         'CI': '1',

//         },
//       commands: [
//         'export PATH="$NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH"',
//         'git clone https://github.com/oxen-io/session-desktop/ --single-branch --depth=1 -b $SESSION_BRANCH $SESSION_DESKTOP_ROOT',
//         'cd $SESSION_DESKTOP_ROOT &&  yarn install --frozen && yarn build-everything',
//         'cd $DRONE_WORKSPACE && yarn install --frozen && cd -',
//         'cd $DRONE_WORKSPACE && time xvfb-run --auto-servernum yarn test --shard=' + shard_number,
//       ],

//     },

//   ], node:
//         {session: 'playwright'},
// };



// local restore_cache(shard_number) = {
//   kind: 'pipeline',
//   type: 'docker',
//   name: 'restore-cache',
//   platform: { arch: 'amd64' },
//   steps: [
//     {
//       name: 'restore-cache',
//       image: 'meltwater/drone-cache',
//       pull: true,
//       environment: {
//         'AWS_ACCESS_KEY_ID': {from_secret: 'aws_access_key_id'},
//         'AWS_SECRET_ACCESS_KEY': {from_secret: 'aws_secret_access_key'},
//       },
//       settings: {
//         restore: true,
//         cache_key: '{{ .Repo.Name }}_{{ checksum "session-desktop/node_modules/yarn.lock" }}_{{ arch }}_{{ os }}',
//         archive_format: "gzip",
//         bucket: 'session-playwright-test',
//         region: 'ap-southeast-2',
//         mount: ['session-desktop/node_modules'],
//       }
//     },
//   ],
// };

// local rebuild_cache(shard_number) = {
//   kind: 'pipeline',
//   type: 'docker',
//   name: 'rebuild-cache-' + shard_number,
//   platform: { arch: 'amd64' },
//   steps: [
//     {
//     name: 'rebuild-cache',
//     image: 'meltwater/drone-cache',
//     pull: true,
//     environment: {
//       'AWS_ACCESS_KEY_ID': {from_secret: 'aws_access_key_id'},
//       'AWS_SECRET_ACCESS_KEY': {from_secret: 'aws_secret_access_key'},
//         },
//     settings: {
//       rebuild: true,
//       archive_format: "gzip",
//       bucket: 'session-playwright-test',
//       region: 'ap-southeast-2',
//       mount: ['session-desktop/node_modules'],
//         }
//     },
//   ],
// };


// [
//   playwright_shard('1/9'),
//   playwright_shard('2/9'),
//   playwright_shard('3/9'),
//   playwright_shard('4/9'),
//   playwright_shard('5/9'),
//   playwright_shard('6/9'),
//   playwright_shard('7/9'),
//   playwright_shard('8/9'),
//   playwright_shard('9/9'),
// ]

