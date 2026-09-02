import { ObjectMap, Tree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import { syncChanges } from "../../src/dev/dev.js";

/**
 * @typedef {import("@weborigami/async-tree").SyncTree} SyncTree
 */

describe("syncChanges", () => {
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
        a: 1,
        e: 5,
        sub: {
          d: undefined,
        },
      },
      { deep: true },
    );

    await syncChanges(source, target);

    const plain = await Tree.plain(target);
    assert.deepEqual(plain, {
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
