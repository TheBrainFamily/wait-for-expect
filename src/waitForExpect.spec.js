/* eslint-env jest */
const waitForExpect = require("./index");

let numberToChange = 10;

test("it waits for the number to change", async () => {
  setTimeout(() => {
    numberToChange = 100;
  }, 600);
  await waitForExpect(() => {
    expect(numberToChange).toEqual(100);
  });
});
