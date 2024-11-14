import assert from "node:assert";
import { describe, test } from "node:test";
import { Tree } from "../../src/internal.js";
import takeFn from "../../src/operations/takeFn.js";

describe("takeFn", () => {
  test("limits the number of keys to the indicated count", async () => {
    const tree = {
      a: 1,
      b: 2,
      c: 3,
      d: 4,
    };
    const result = await takeFn(2)(tree);
    assert.deepEqual(await Tree.plain(result), {
      a: 1,
      b: 2,
    });
  });
});
