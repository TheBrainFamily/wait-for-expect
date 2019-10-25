/* eslint-env jest */
// XXX Not sure how to make eslint not to complain here, but looks like this
// declaration works, so leaving it for now
declare namespace jest {
  interface Matchers<R> {
    toBeInRange(range: { min: number; max: number }): R;
  }
}

function toBeInRange<T>(
  received: number,
  { min, max }: { min: number; max: number }
) {
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

expect.extend({ toBeInRange });
