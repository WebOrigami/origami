import { Tree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import naturalOrder from "../../src/origami/naturalOrder.js";

describe("naturalOrder", () => {
  test("sorts a tree's keys using natural sort order", async () => {
    const tree = {
      1: "one",
      10: "ten",
      2: "two",
    };
    const sorted = await Tree.sort(tree, naturalOrder);
    const treeKeys = await Tree.keys(sorted);
    assert.deepEqual(treeKeys, ["1", "2", "10"]);
  });
});
