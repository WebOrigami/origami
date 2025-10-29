import assert from "node:assert";
import { describe, test } from "node:test";
import invokeFunctions from "../../src/operations/invokeFunctions.js";
import plain from "../../src/operations/plain.js";

describe("invokeFunctions", () => {
  test("invokes function values, leaves other values as is", async () => {
    const fixture = await invokeFunctions({
      a: 1,
      b: () => 2,
    });
    assert.deepEqual(await plain(fixture), {
      a: 1,
      b: 2,
    });
  });
});
