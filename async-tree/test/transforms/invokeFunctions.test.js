import assert from "node:assert";
import { describe, test } from "node:test";
import { Tree } from "../../src/internal.js";
import invokeFunctions from "../../src/transforms/invokeFunctions.js";

describe("invokeFunctions", () => {
  test("invokes function values, leaves other values as is", async () => {
    const fixture = invokeFunctions({
      a: 1,
      b: () => 2,
    });
    assert.deepEqual(await Tree.plain(fixture), {
      a: 1,
      b: 2,
    });
  });
});
