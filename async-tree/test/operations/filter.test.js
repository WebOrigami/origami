import assert from "node:assert";
import { describe, test } from "node:test";
import { Tree } from "../../src/internal.js";
import filter from "../../src/operations/filter.js";

describe("filter", () => {
  test("removes keys and values whose filter values are falsy", async () => {
    const result = filter(
      {
        a: 1,
        b: 2,
        c: {
          d: 3,
          e: 4,
        },
      },
      {
        a: true,
        c: {
          d: true,
        },
      }
    );
    assert.deepEqual(await result.keys(), ["a", "c/"]);
    assert.deepEqual(await Tree.plain(result), {
      a: 1,
      c: {
        d: 3,
      },
    });
  });
});
