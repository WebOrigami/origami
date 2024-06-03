import assert from "node:assert";
import { describe, test } from "node:test";
import { Tree } from "../../src/internal.js";
import merge from "../../src/operations/merge.js";

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

    const c = await Tree.traverse(fixture, "b", "c");
    assert.equal(c, undefined);
  });
});
