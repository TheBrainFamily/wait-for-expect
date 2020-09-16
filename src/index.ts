import { getSetTimeoutFn } from "./helpers";

const defaults = {
  timeout: 4500,
  interval: 50,
  minConsecutivePasses: 1
};

const consecutivePassesDefaultError = new Error(
  "Test have not passed the min number of consecutive required runs, might be a flaky test"
);

/**
 * Waits for the expectation to pass and returns a Promise
 *
 * @param  expectation  Function  Expectation that has to complete without throwing
 * @param  timeout  Number  Maximum wait interval, 4500ms by default
 * @param  interval  Number  Wait-between-retries interval, 50ms by default
 * @return  Promise  Promise to return a callback result
 */
const waitForExpect = function waitForExpect(
  expectation: () => void | Promise<void>,
  timeout = defaults.timeout,
  interval = defaults.interval,
  minConsecutivePasses = defaults.minConsecutivePasses
) {
  const setTimeout = getSetTimeoutFn();

  // eslint-disable-next-line no-param-reassign
  if (interval < 1) interval = 1;
  const maxTries = Math.ceil(timeout / interval);
  let tries = 0;
  let consecutivePasses = 0;
  let lastError = consecutivePassesDefaultError;
  return new Promise((resolve, reject) => {
    const getRejectOrRerun = (resetConsecutivePasses: boolean) => (
      error: Error
    ) => {
      if (resetConsecutivePasses) {
        consecutivePasses = 0;
        lastError = error;
      }
      if (tries > maxTries) {
        reject(error);
        return;
      }
      // eslint-disable-next-line no-use-before-define
      setTimeout(runExpectation, interval);
    };
    function runExpectation() {
      tries += 1;
      try {
        Promise.resolve(expectation())
          .then(() => {
            consecutivePasses += 1;
            if (consecutivePasses === minConsecutivePasses) {
              resolve();
              return;
            }
            getRejectOrRerun(false)(lastError);
          })
          .catch(getRejectOrRerun(true));
      } catch (error) {
        getRejectOrRerun(true)(error);
      }
    }
    setTimeout(runExpectation, 0);
  });
};

waitForExpect.defaults = defaults;

export default waitForExpect;
