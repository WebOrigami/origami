import assert from "node:assert";
import { describe, test } from "node:test";
import FunctionTree from "../../src/drivers/FunctionTree.js";
import { Tree } from "../../src/internal.js";
import concat from "../../src/operations/concat.js";

describe("concat", () => {
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
    const result = await concat.call(null, tree);
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
    const result = await concat.call(null, specimens);
    assert.equal(result, "aAbBcC");
  });
});
