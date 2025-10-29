import assert from "node:assert";
import { describe, test } from "node:test";
import DeepObjectMap from "../../src/drivers/DeepObjectMap.js";
import ObjectMap from "../../src/drivers/ObjectMap.js";
import keys from "../../src/operations/keys.js";
import merge from "../../src/operations/merge.js";
import plain from "../../src/operations/plain.js";
import traverse from "../../src/operations/traverse.js";

describe("merge", () => {
  test("performs a shallow merge", async () => {
    const fixture = await merge(
      new ObjectMap({
        a: 1,
        // Will be obscured by `b` that follows
        b: {
          c: 2,
        },
      }),
      new ObjectMap({
        b: {
          d: 3,
        },
        e: {
          f: 4,
        },
      })
    );

    assert.deepEqual(await plain(fixture), {
      a: 1,
      b: {
        d: 3,
      },
      e: {
        f: 4,
      },
    });

    // Merge is shallow, and last tree wins, so `b/c` doesn't exist
    const c = await traverse(fixture, "b", "c");
    assert.equal(c, undefined);
  });

  test("subtree can overwrite a leaf node", async () => {
    const fixture = await merge(
      new ObjectMap({
        a: 1,
      }),
      new DeepObjectMap({
        a: {
          b: 2,
        },
      })
    );
    assert.deepEqual(await keys(fixture), ["a/"]);
    assert.deepEqual(await plain(fixture), {
      a: {
        b: 2,
      },
    });
  });

  test("if all arguments are plain objects, result is a plain object", async () => {
    const result = await merge(
      {
        a: 1,
        b: 2,
      },
      {
        c: 3,
        d: 4,
      }
    );
    assert.deepEqual(result, {
      a: 1,
      b: 2,
      c: 3,
      d: 4,
    });
  });
});
