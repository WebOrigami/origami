import { ObjectTree, Tree } from "@graphorigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import merge from "../../src/operations/merge.js";

describe("merge", () => {
  test("performs a shallow merge", async () => {
    const fixture = merge(
      new ObjectTree({
        a: 1,
        b: {
          c: 2,
        },
      }),
      new ObjectTree({
        // Will be obscured by `b` above
        b: {
          d: 3,
        },
        e: {
          f: 4,
        },
      })
    );

    assert.deepEqual(await Tree.plain(fixture), {
      a: 1,
      b: {
        c: 2,
      },
      e: {
        f: 4,
      },
    });

    const d = await Tree.traverse(fixture, "b", "d");
    assert.equal(d, undefined);
  });
});
