import assert from "node:assert";
import { describe, test } from "node:test";
import randomBasedOn from "../../src/origami/randomBasedOn.js";

describe("randomBasedOn", () => {
  test("returns a predictable sequence for a given seed", async () => {
    const seedData = "test-seed";
    const rng1 = randomBasedOn(seedData);
    const rng2 = randomBasedOn(seedData);

    for (let i = 0; i < 10; i++) {
      assert.strictEqual(rng1(), rng2());
    }
  });
});
