/* eslint-env jest */
import "./toBeInRangeMatcher";
import waitForExpect from "./index";

// this is a copy of "it waits for expectation to pass" modified to use jestFakeTimers
// This breakes when we remove the const { setTimeout } = typeof window !== "undefined" ? window : global;
// line from the index.ts

test("it works even if the timers are overwritten by jest", async () => {
  jest.useFakeTimers();
  let numberToChange = 10;
  // we are using random timeout here to simulate a real-time example
  // of an async operation calling a callback at a non-deterministic time
  const randomTimeout = Math.floor(Math.random() * 300);

  setTimeout(() => {
    numberToChange = 100;
  }, randomTimeout);

  jest.runAllTimers();
  await waitForExpect(() => {
    expect(numberToChange).toEqual(100);
  });
});
