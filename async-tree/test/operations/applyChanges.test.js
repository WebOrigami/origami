import assert from "node:assert";
import { describe, test } from "node:test";
import ObjectMap from "../../src/drivers/ObjectMap.js";
import applyChanges from "../../src/operations/applyChanges.js";
import plain from "../../src/operations/plain.js";

/**
 * @typedef {import("../../index.ts").SyncTree} SyncTree
 */

describe("applyChanges", () => {
  test("applies changes indicated in source and target manifests", async () => {
    /** @type {SyncTree} */
    const target = new ObjectMap(
      {
        a: 1,
        sub: {
          b: 2,
          more: {
            c: 3,
          },
          d: 4,
        },
      },
      { deep: true },
    );

    /** @type {SyncTree} */
    const source = new ObjectMap(
      {
        a: 1, // left as is
        sub: {
          b: 2, // left as is
          more: {
            c: 3, // left as is
          },
          d: undefined, // deletes d
        },
        e: 5, // adds e
      },
      { deep: true },
    );

    await applyChanges(target, source);

    assert.deepEqual(await plain(target), {
      a: 1,
      sub: {
        b: 2,
        more: {
          c: 3,
        },
      },
      e: 5,
    });
  });
});
