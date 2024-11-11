import assert from "node:assert";
import { describe, test } from "node:test";
import once from "../../src/origami/once.js";

describe("once", () => {
  test("evaluates a function only once", async () => {
    let counter = 0;
    const promise = once.call(null, () => ++counter);
    assert.strictEqual(await promise, 1);
    assert.strictEqual(await promise, 1);
  });
});
