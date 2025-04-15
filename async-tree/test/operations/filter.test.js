import assert from "node:assert";
import { describe, test } from "node:test";
import { Tree } from "../../src/internal.js";
import filter from "../../src/operations/filter.js";

describe("filter", () => {
  test("returns values that pass a filter function", async () => {
    const result = await filter(
      {
        a: 1,
        b: 2,
        c: 3,
        d: 4,
      },
      (value) => value % 2 === 1 // odd
    );
    assert.deepEqual(await Tree.plain(result), {
      a: 1,
      c: 3,
    });
  });

  test("returns deep values that pass a filter function", async () => {
    const result = await filter(
      {
        a: 1,
        b: 2,
        c: {
          d: 3,
          e: 4,
        },
      },
      {
        deep: true,
        test: (value) => value % 2 === 1, // odd
      }
    );
    assert.deepEqual(await Tree.plain(result), {
      a: 1,
      c: {
        d: 3,
      },
    });
  });
});
