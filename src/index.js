function flushPromises() {
  return new Promise(resolve => setImmediate(resolve));
}

function waitUntil(predicate, timerTimeout, timerInterval) {
  return new Promise((resolve, reject) => {
    let timer;
    let timeoutTimer;
    const clearTimers = function clearWaitTimers() {
      clearTimeout(timeoutTimer);
      clearInterval(timer);
    };

    const doStep = function doTimerStep() {
      let result;

      try {
        result = predicate();
        if (result) {
          clearTimers();
          resolve(result);
        } else {
          timer = setTimeout(doStep, timerInterval);
        }
      } catch (e) {
        clearTimers();
        reject(e);
      }
    };
    flushPromises().then(() => {
      timer = setTimeout(doStep, 0);
      timeoutTimer = setTimeout(() => {
        clearTimers();
        reject(new Error(`Timed out after waiting for ${timerTimeout}ms`));
      }, timerTimeout);
    });
  });
}
/**
 * Waits for predicate to not throw and returns a Promise
 *
 * @param  expectation  Function  Predicate that has to complete without throwing
 * @param  timeout  Number  Maximum wait interval, 4500ms by default
 * @param  interval  Number  Wait interval, 50ms by default
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
