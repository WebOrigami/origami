import assert from "node:assert";
import { describe, test } from "node:test";
import ObjectMap from "../../src/drivers/ObjectMap.js";
import root from "../../src/operations/root.js";
import traverse from "../../src/operations/traverse.js";

describe("root", () => {
  test("returns root of a tree", async () => {
    const tree = new ObjectMap(
      {
        a: {
          b: {
            c: {},
          },
        },
      },
      { deep: true },
    );
    const c = await traverse(tree, "a", "b", "c");
    const r = c ? await root(c) : undefined;
    assert.strictEqual(r, tree);
  });
});
