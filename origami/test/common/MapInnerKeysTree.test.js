import { Tree } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import MapInnerKeysTree from "../../src/common/MapInnerKeysTree.js";

describe("MapInnerKeysTree", () => {
  test("maps inner keys to outer keys", async () => {
    const tree = new MapInnerKeysTree(
      {
        a: 1,
        b: 2,
        c: 3,
      },
      (value, key) => key.toUpperCase()
    );
    assert.deepEqual(await Tree.plain(tree), {
      A: 1,
      B: 2,
      C: 3,
    });
  });
});
