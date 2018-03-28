function flushPromises() {
  return new Promise(resolve => setImmediate(resolve));
}

function waitUntil(expectation, timeout, interval) {
  return new Promise((resolve, reject) => {
    let timeoutTimer;
    function doStep() {
      if (expectation()) {
        clearTimeout(timeoutTimer);
        resolve();
      } else {
        setTimeout(doStep, interval);
      }
    }
    flushPromises().then(() => {
      setTimeout(doStep, 0);
      timeoutTimer = setTimeout(() => {
        reject(new Error(`Timed out after waiting for ${timeout}ms`));
      }, timeout);
    });
  });
}
/**
 * Waits for the expectation to pass and returns a Promise
 *
 * @param  expectation  Function  Expectation that has to complete without throwing
 * @param  timeout  Number  Maximum wait interval, 4500ms by default
 * @param  interval  Number  Wait-between-retries interval, 50ms by default
 * @return  Promise  Promise to return a callback result
 */

module.exports = (expectation, timeout = 4500, interval = 50) =>
  waitUntil(
    () => {
      try {
        expectation();
      } catch (e) {
        return false;
      }
      return true;
    },
    timeout,
    interval
  ).catch(() => {
    expectation();
  });
