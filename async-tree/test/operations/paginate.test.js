import assert from "node:assert";
import { describe, test } from "node:test";
import { Tree } from "../../src/internal.js";
import paginate from "../../src/operations/paginate.js";

describe("paginate", () => {
  test("divides tree keys into fixed-length chunks", async () => {
    const treelike = {
      a: 1,
      b: 2,
      c: 3,
      d: 4,
      e: 5,
    };
    const paginated = await paginate.call(null, treelike, 2);
    const plain = await Tree.plain(paginated);
    assert.deepEqual(await plain, {
      1: {
        items: { a: 1, b: 2 },
        nextPage: 2,
        pageCount: 3,
        pageNumber: 1,
        previousPage: null,
      },
      2: {
        items: { c: 3, d: 4 },
        nextPage: 3,
        pageCount: 3,
        pageNumber: 2,
        previousPage: 1,
      },
      3: {
        items: { e: 5 },
        nextPage: null,
        pageCount: 3,
        pageNumber: 3,
        previousPage: 2,
      },
    });
  });
});
