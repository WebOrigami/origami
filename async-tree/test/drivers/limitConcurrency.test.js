import assert from "node:assert";
import { before, describe, test } from "node:test";
import limitConcurrency from "../../src/drivers/limitConcurrency.js";

describe("limitConcurrency", async () => {
  before(async () => {
    // Confirm our limited functions throws on too many calls
    const fn = createFixture();
    try {
      const array = Array.from({ length: 10 }, (_, index) => index);
      await Promise.all(array.map((index) => fn(index)));
    } catch (/** @type {any} */ error) {
      assert.equal(error.message, "Too many calls");
    }
  });

  test("limits the number of concurrent calls", async () => {
    const fn = createFixture();
    const limitedFn = limitConcurrency(fn, 3);
    const array = Array.from({ length: 10 }, (_, index) => index);
    const result = await Promise.all(array.map((index) => limitedFn(index)));
    assert.deepEqual(result, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
});

// Return a function that only permits a limited number of concurrent calls and
// simulates a delay for each request.
function createFixture() {
  let activeCalls = 0;
  const maxActiveCalls = 3;

  return async function (n) {
    if (activeCalls >= maxActiveCalls) {
      throw new Error("Too many calls");
    }
    activeCalls++;
    await new Promise((resolve) => setTimeout(resolve, 10));
    activeCalls--;
    return n;
  };
}
