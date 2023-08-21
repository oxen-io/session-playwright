local playwright_shard(shard_number) = {
  kind: 'pipeline',
  type: 'docker',
  name: 'session-integration-tests-' + shard_number,
  platform: { arch: 'amd64' },
  steps: [
    {
      name: 'playwright tests',
      image: 'registry.oxen.rocks/lokinet-ci-playwrightv1.37.0-jammy',
      # pull: 'always',
      environment: {
        'NVM_DIR': '/usr/local/nvm',
        'NODE_VERSION': '18.15.0',
        'SESSION_DESKTOP_ROOT': '/root/session-desktop',
        'NODE_PATH': '$NVM_DIR/v$NODE_VERSION/lib/node_modules',
        'SESSION_BRANCH': 'unstable',
        'PLAYWRIGHT_RETRIES_COUNT': '0',
        'PLAYWRIGHT_WORKER_COUNT': '1',
        'CI': '1',

        },
      commands: [
        'export PATH="$NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH"',
        'git clone https://github.com/oxen-io/session-desktop/ --single-branch --depth=1 -b $SESSION_BRANCH $SESSION_DESKTOP_ROOT',
        'cd $SESSION_DESKTOP_ROOT && yarn install --frozen && yarn build-everything',
        'cd $DRONE_WORKSPACE && yarn install --frozen && cd -',
        'cd $DRONE_WORKSPACE && time xvfb-run --auto-servernum yarn test --shard=' + shard_number,
      ],

    },

  ], node:
        {session: 'playwright'},
};


[
  playwright_shard('1/9'),
  playwright_shard('2/9'),
  playwright_shard('3/9'),
  playwright_shard('4/9'),
  playwright_shard('5/9'),
  playwright_shard('6/9'),
  playwright_shard('7/9'),
  playwright_shard('8/9'),
  playwright_shard('9/9'),
]

