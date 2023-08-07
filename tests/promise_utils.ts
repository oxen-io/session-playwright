export const sleepFor = async (ms: number, showLog = false) => {
  if (showLog) {
    // eslint-disable-next-line no-console
    console.info(`sleeping for ${ms}ms...`);
  }
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};
