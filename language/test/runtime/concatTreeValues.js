import { Tree } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import concatTreeValues from "../../src/runtime/concatTreeValues.js";

describe("concatTreeValues", () => {
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
    const result = await concatTreeValues.call(null, tree);
    assert.equal(result, "ABCDE");
  });
});
