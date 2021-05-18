import chai from "chai";
import ExplorableObject from "../../src/core/ExplorableObject.js";
import link from "../../src/eg/link.js";
const { assert } = chai;

describe("link", () => {
  it("can replace keys in a parsed tree with the functions to apply", async () => {
    // Here, `parsed` maches output format from parse() for the expression
    // `fn(fn(a, b))`.
    const parsed = ["fn", ["fn", "a", "b"]];

    function fn() {}
    const scope = new ExplorableObject({
      fn: fn, // Maps string key "fn" to `fn` function defined above.
    });
    const linked = await link(parsed, scope);
    assert.deepEqual(linked, [fn, [fn, "a", "b"]]);
  });
});
