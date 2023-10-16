import { Tree } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import MergeDeepTree from "../../src/common/MergeDeepTree.js";

describe("MergeDeepTree", () => {
  test("can merge deep", async () => {
    const fixture = new MergeDeepTree(
      {
        a: {
          b: 1,
          c: {
            d: 2,
          },
        },
      },
      {
        a: {
          b: 0, // Will be obscured by `b` above
          c: {
            e: 3,
          },
          f: 4,
        },
      }
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
