import assert from "node:assert";
import { describe, test } from "node:test";
import * as Tree from "../../src/Tree.js";
import sortNatural from "../../src/transforms/sortNatural.js";

describe("sortNatural transform", () => {
  test("sorts keys", async () => {
    const tree = Tree.from({
      file10: null,
      file1: null,
      file9: null,
    });
    const sortTransform = sortNatural();
    const sorted = await sortTransform(tree);
    assert.deepEqual(Array.from(await sorted.keys()), [
      "file1",
      "file9",
      "file10",
    ]);
  });
});
