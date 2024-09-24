import assert from "node:assert";
import { describe, test } from "node:test";
import { DeepObjectTree, ObjectTree, Tree } from "../../src/internal.js";
import merge from "../../src/operations/merge.js";
import * as symbols from "../../src/symbols.js";

describe("merge", () => {
  test("performs a shallow merge", async () => {
    const fixture = merge(
      {
        a: 1,
        // Will be obscured by `b` that follows
        b: {
          c: 2,
        },
      },
      {
        b: {
          d: 3,
        },
        e: {
          f: 4,
        },
      }
    );

    assert.deepEqual(await Tree.plain(fixture), {
      a: 1,
      b: {
        d: 3,
      },
      e: {
        f: 4,
      },
    });

    // Merge is shallow, and last tree wins, so `b/c` doesn't exist
    const c = await Tree.traverse(fixture, "b", "c");
    assert.equal(c, undefined);

    // Parent of a subvalue is the merged tree
    const b = await fixture.get("b");
    assert.equal(b[symbols.parent], fixture);
  });

  test("subtree can overwrite a leaf node", async () => {
    const fixture = merge(
      new ObjectTree({
        a: 1,
      }),
      new DeepObjectTree({
        a: {
          b: 2,
        },
      })
    );
    assert.deepEqual([...(await fixture.keys())], ["a/"]);
    assert.deepEqual(await Tree.plain(fixture), {
      a: {
        b: 2,
      },
    });
  });
});
