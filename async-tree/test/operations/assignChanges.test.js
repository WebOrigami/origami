import assert from "node:assert";
import { describe, test } from "node:test";
import ObjectMap from "../../src/drivers/ObjectMap.js";
import assignChanges from "../../src/operations/assignChanges.js";
import plain from "../../src/operations/plain.js";

/**
 * @typedef {import("../../index.ts").SyncTree} SyncTree
 */

describe("assignChanges", () => {
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

    await assignChanges(source, target);

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
