import { Tree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import paginate from "../../src/builtins/@paginate.js";

describe("@paginate", () => {
  test("divides tree keys into fixed-length chunks", async () => {
    const treelike = {
      a: 1,
      b: 2,
      c: 3,
      d: 4,
      e: 5,
    };
    const paginated = await paginate.call(null, treelike, 2);
    assert.deepEqual(await Tree.plain(paginated), [
      {
        items: { a: 1, b: 2 },
        nextKey: 1,
        previousKey: null,
      },
      {
        items: { c: 3, d: 4 },
        nextKey: 2,
        previousKey: 0,
      },
      {
        items: { e: 5 },
        nextKey: null,
        previousKey: 1,
      },
    ]);
  });
});
