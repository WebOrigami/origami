import assert from "node:assert";
import { describe, test } from "node:test";
import { DeepObjectTree, Tree } from "../../src/internal.js";
import inners from "../../src/operations/inners.js";

describe("inners", () => {
  test("returns the interior nodes of a tree", async () => {
    const obj = new DeepObjectTree({
      a: 1,
      b: {
        c: 2,
        d: {
          e: 3,
        },
      },
      f: 4,
      g: {
        h: 5,
      },
    });
    const result = await inners(obj);
    const plain = await Tree.plain(result);
    assert.deepEqual(plain, {
      b: {
        d: {},
      },
      g: {},
    });
  });
});
