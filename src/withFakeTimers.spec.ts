/* eslint-env jest */
import "./toBeInRangeMatcher";
import waitForExpect from "./index";

// this is a copy of "it waits for expectation to pass" modified to use jestFakeTimers and two ways of Date.now mocking
// This breakes when we remove the const { setTimeout, Date: { now } } = typeof window !== "undefined" ? window : global;
// line from the index.ts

beforeEach(() => {
  jest.resetModules();
  jest.restoreAllMocks();
  jest.useRealTimers();
});

test("it always uses real timers even if they were set to fake before importing the module", async () => {
  jest.useFakeTimers();
  /* eslint-disable global-require */
  const importedWaitForExpect = require("./index");
  jest.useRealTimers();

  let numberToChange = 10;
  // we are using random timeout here to simulate a real-time example
  // of an async operation calling a callback at a non-deterministic time
  const randomTimeout = Math.floor(Math.random() * 300);

  setTimeout(() => {
    numberToChange = 100;
  }, randomTimeout);

  jest.useFakeTimers();

  await importedWaitForExpect(() => {
    expect(numberToChange).toEqual(100);
  });
});

// Date.now might be mocked with two main ways:
// via mocking whole Date, or by mocking just Date.now
// hence two test cases covered both ways
test("it works even if the Date was mocked", async () => {
  /* eslint-disable no-global-assign */
  // @ts-ignore: Cannot reassign to const Date
  Date = jest.fn(() => ({
    now() {
      return 1482363367071;
    }
  }));
  /* eslint-enable */
  let numberToChange = 10;

  setTimeout(() => {
    numberToChange = 100;
  }, 100);
  let expectFailingMessage;
  try {
    await waitForExpect(() => {
      expect(numberToChange).toEqual(101);
    }, 1000);
  } catch (e) {
    expectFailingMessage = e.message;
  }
  expect(expectFailingMessage).toMatch(/toEqual/);
  expect(expectFailingMessage).toMatch("101");
  expect(expectFailingMessage).toMatch("Received:");
  expect(expectFailingMessage).toMatch("100");
});

test("it works even if the Date.now was mocked", async () => {
  Date.now = jest.fn(() => 1482363367071);
  let numberToChange = 10;

  setTimeout(() => {
    numberToChange = 100;
  }, 100);
  let expectFailingMessage;
  try {
    await waitForExpect(() => {
      expect(numberToChange).toEqual(101);
    }, 1000);
  } catch (e) {
    expectFailingMessage = e.message;
  }
  expect(expectFailingMessage).toMatch(/toEqual/);
  expect(expectFailingMessage).toMatch("101");
  expect(expectFailingMessage).toMatch("Received:");
  expect(expectFailingMessage).toMatch("100");
});
