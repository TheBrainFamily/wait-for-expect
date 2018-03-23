# wait-for-expect
Wait for expectation to be true, useful for integration and end to end testing

Usage:

```javascript
const waitForExpect = require("wait-for-expect")
let numberToChange = 10;

test("it waits for the number to change", async () => {
  setTimeout(() => {
    numberToChange = 100;
  }, 600);
  
  await waitForExpect(() => {
    expect(numberToChange).toEqual(100)
  });
});
```

instead of:

```javascript
let numberToChange = 10;

test("it waits for the number to change", () => {
  setTimeout(() => {
    numberToChange = 100;
  }, 600);
  setTimeout(() => {
    expect(numberToChange).toEqual(100);
  }, 700);
});
```

It will check whether the expectation passes right away after flushing all promises (very useful with, for example, integration testing of react when mocking fetches, like here: https://github.com/kentcdodds/react-testing-library#usage)

If it won't, it will keep repeating for the default of 4.5 seconds, every 50 ms. 

Nice thing about this simple tool is that if the expectation keeps failing till the timeout, it will check it one last time, but this time the same way your test runner would run it - so you basically get your expectation library error, the sam way like if you used setTimeout to wait but didn't wait long enough.

If I change the expectation to wait for 105 in above example, you will get nice and familiar:

```

 FAIL  src/waitForExpect.spec.js (5.042s)
  ✕ it waits for the number to change (4511ms)

  ● it waits for the number to change

    expect(received).toEqual(expected)
    
    Expected value to equal:
      105
    Received:
      100

       9 |   }, 600);
      10 |   await waitForExpect(() => {
    > 11 |     expect(numberToChange).toEqual(105);
      12 |   });
      13 | });
      14 | 
      
      at waitForExpect (src/waitForExpect.spec.js:11:28)
      at waitUntil.catch (src/index.js:61:5)

Test Suites: 1 failed, 1 total
Tests:       1 failed, 1 total
Snapshots:   0 total
Time:        5.807s
```
