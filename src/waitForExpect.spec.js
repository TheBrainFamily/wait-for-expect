/* eslint-env jest */
const waitForExpect = require("./index");

test("it waits for expectation to pass", async () => {
  let numberToChange = 10;
  // we are using random timeout here to simulate a real-time example
  // of an async operation calling a callback at a non-deterministic time
  const randomTimeout = Math.floor(Math.random() * 300);

  setTimeout(() => {
    numberToChange = 100;
  }, randomTimeout);

  await waitForExpect(() => {
    expect(numberToChange).toEqual(100);
  });
});

test(
  "it fails properly with jest error message when it times out without expectation passing",
  async done => {
    const numberNotToChange = 200;

    try {
      await waitForExpect(() => {
        expect(numberNotToChange).toEqual(2000);
      }, 300);
    } catch (e) {
      expect(e.message).toMatchSnapshot();
      done();
    }
  },
  1000
);

test(
  "it fails when the change didn't happen fast enough, based on the waitForExpect timeout",
  async done => {
    let numberToChangeTooLate = 300;
    const timeToPassForTheChangeToHappen = 1000;

    setTimeout(() => {
      numberToChangeTooLate = 3000;
    }, timeToPassForTheChangeToHappen);

    try {
      await waitForExpect(() => {
        expect(numberToChangeTooLate).toEqual(3000);
      }, timeToPassForTheChangeToHappen - 200);
    } catch (e) {
      expect(e.message).toMatchSnapshot();
      done();
    }
  },
  1500
);

expect.extend({
  toBeInRange(received, { min, max }) {
    const pass = received >= min && received <= max;
    if (pass) {
      return {
        message: () => `expected ${received} < ${min} or ${max} < ${received}`,
        pass: true
      };
    }
    return {
      message: () => `expected ${min} >= ${received} >= ${max}`,
      pass: false
    };
  }
});

test("it reruns the expectation every x ms, as provided with the second argument", async () => {
  // using this would be preferable but somehow jest shares the expect.assertions between tests!
  // expect.assertions(1 + Math.floor(timeout / interval) + 1);
  let timesRun = 0;
  const timeout = 600;
  const interval = 150;
  try {
    await waitForExpect(
      () => {
        timesRun += 1;
        expect(true).toEqual(false);
      },
      timeout,
      interval
    );
  } catch (e) {
    // initial run + reruns + final run
    const expectedTimesToRun = 1 + Math.floor(timeout / interval) + 1;
    expect(timesRun).toBeInRange({
      min: expectedTimesToRun - 1,
      max: expectedTimesToRun + 1
    });
  }
});
