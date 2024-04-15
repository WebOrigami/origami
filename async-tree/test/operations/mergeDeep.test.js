import assert from "node:assert";
import { describe, test } from "node:test";
import { DeepObjectTree, Tree } from "../../src/internal.js";
import mergeDeep from "../../src/operations/mergeDeep.js";

describe("mergeDeep", () => {
  test("can merge deep", async () => {
    const fixture = mergeDeep(
      new DeepObjectTree({
        a: {
          b: 1,
          c: {
            d: 2,
          },
        },
      }),
      new DeepObjectTree({
        a: {
          b: 0, // Will be obscured by `b` above
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
