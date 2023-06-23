import assert from "node:assert";
import { describe, test } from "node:test";
import concat from "../../../src/builtins/@graph/concat.js";

describe("@graph/concat", () => {
  test("concatenates multiple strings", async () => {
    const result = await concat.call(null, "a", "b", "c");
    assert.equal(result, "abc");
  });

  test("concatenates graph text", async () => {
    const graph = {
      a: "A",
      b: "B",
      c: "C",
      more: {
        d: "D",
        e: "E",
      },
    };
    const result = await concat.call(null, graph);
    assert.equal(result, "ABCDE");
  });
});
