import concat from "../../src/cli/builtins/concat.js";
import assert from "../assert.js";

describe("concat", () => {
  it("concatenates multiple strings", async () => {
    const result = await concat("a", "b", "c");
    assert.equal(result, "abc");
  });

  it("concatenates graph text", async () => {
    const graph = {
      a: "A",
      b: "B",
      c: "C",
      more: {
        d: "D",
        e: "E",
      },
    };
    const result = await concat(graph);
    assert.equal(result, "ABCDE");
  });
});
