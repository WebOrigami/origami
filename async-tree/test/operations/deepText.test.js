import assert from "node:assert";
import { describe, test } from "node:test";
import FunctionTree from "../../src/drivers/FunctionTree.js";
import { Tree } from "../../src/internal.js";
import deepText from "../../src/operations/deepText.js";

describe("deepText", () => {
  test("concatenates deep tree values", async () => {
    const tree = Tree.from({
      a: "A",
      b: "B",
      c: "C",
      more: {
        d: "D",
        e: "E",
      },
    });
    const result = await deepText(tree);
    assert.equal(result, "ABCDE");
  });

  test("concatenates deep tree-like values", async () => {
    const letters = ["a", "b", "c"];
    const specimens = new FunctionTree(
      (letter) => ({
        lowercase: letter,
        uppercase: letter.toUpperCase(),
      }),
      letters
    );
    const result = await deepText(specimens);
    assert.equal(result, "aAbBcC");
  });
});
