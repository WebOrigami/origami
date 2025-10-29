import assert from "node:assert";
import { describe, test } from "node:test";
import FunctionMap from "../../src/drivers/FunctionMap.js";
import deepText from "../../src/operations/deepText.js";
import from from "../../src/operations/from.js";

describe("deepText", () => {
  test("concatenates deep tree values", async () => {
    const tree = from({
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
    const specimens = new FunctionMap(
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
