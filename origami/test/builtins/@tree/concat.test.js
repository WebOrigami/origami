import assert from "node:assert";
import { describe, test } from "node:test";
import concat from "../../../src/builtins/@tree/concat.js";

describe("@tree/concat", () => {
  test("concatenates multiple strings", async () => {
    const result = await concat.call(null, "a", "b", "c");
    assert.equal(result, "abc");
  });

  test("concatenates tree text", async () => {
    const tree = {
      a: "A",
      b: "B",
      c: "C",
      more: {
        d: "D",
        e: "E",
      },
    };
    const result = await concat.call(null, tree);
    assert.equal(result, "ABCDE");
  });
});
