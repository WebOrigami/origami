import assert from "node:assert";
import { describe, test } from "node:test";
import { DeepObjectTree, Tree } from "../../src/internal.js";
import deepMerge from "../../src/operations/deepMerge.js";

describe("mergeDeep", () => {
  test("can merge deep", async () => {
    const fixture = deepMerge(
      new DeepObjectTree({
        a: {
          b: 0, // Will be obscured by `b` below
          c: {
            d: 2,
          },
        },
      }),
      new DeepObjectTree({
        a: {
          b: 1,
          c: {
            e: 3,
          },
          f: 4,
        },
      })
    );
    assert.deepEqual(await Tree.plain(fixture), {
      a: {
        b: 1,
        c: {
          d: 2,
          e: 3,
        },
        f: 4,
      },
    });
  });
});
