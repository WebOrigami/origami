import assert from "node:assert";
import { describe, test } from "node:test";
import * as Tree from "../../src/Tree.js";
import merge from "../../src/operations/merge.js";

describe("merge", () => {
  test("performs a shallow merge", async () => {
    const fixture = merge(
      Tree.from({
        a: 1,
        b: {
          c: 2,
        },
      }),
      Tree.from({
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
