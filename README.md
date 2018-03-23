[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![CircleCI](https://circleci.com/gh/TheBrainFamily/wait-for-expect.svg?style=shield)](https://circleci.com/gh/TheBrainFamily/wait-for-expect)

# wait-for-expect
Wait for expectation to be true, useful for integration and end to end testing

Think things like calling external APIs, database operations, or even GraphQL subscriptions. 
We will add examples for all of them soon, for now please enjoy the simple docs. :-)

# Usage:

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

If it doesn't, it will keep repeating for the duration of, at most, the specified timeout, every 50 ms. The default timeout is 4.5 seconds to fit below the default 5 seconds that Jest waits for before throwing an error. 

Nice thing about this simple tool is that if the expectation keeps failing till the timeout, it will check it one last time, but this time the same way your test runner would run it - so you basically get your expectation library error, the sam way like if you used setTimeout to wait but didn't wait long enough.

To show an example - if I change the expectation to wait for 105 in above code, you will get nice and familiar:

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

You can add multiple expectations to wait for, all of them have to pass, and if one of them don't, it will be marked.
For example, let's add another expectation for a different number, notice how jest tells you that that's the expectation that failed.

```
    expect(received).toEqual(expected)
    
    Expected value to equal:
      110
    Received:
      105

      11 |   await waitForExpect(() => {
      12 |     expect(numberToChange).toEqual(100);
    > 13 |     expect(numberThatWontChange).toEqual(110);
      14 |   });
      15 | });
      16 | 
      
      at waitForExpect (src/waitForExpect.spec.js:13:34)
      at waitUntil.catch (src/index.js:61:5)
```


# API
waitForExpect takes 3 arguments, 2 optional.

```javascript
/**
 * Waits for predicate to not throw and returns a Promise
 *
 * @param  expectation  Function  Predicate that has to complete without throwing
 * @param  timeout  Number  Maximum wait interval, 4500ms by default
 * @param  interval  Number  Wait interval, 50ms by default
 * @return  Promise  Promise to return a callback result
 */
```

## Credit
Based on ideas from https://github.com/devlato/waitUntil - mostly build around it with functionality nice for testing. Couldn't depend on it internally because I wanted to add the flushPromises and run the initial expectations right after flushing them, which had to be done in the tool itself :) otherwise tests that should be taking few ms would take all >50ms in the default situation. It might seem trivial but with 100 tests times 45 ms extra your tests would start taking 4.5 seconds instead of 0.5 s :) 
