import { Explorable } from "@explorablegraph/exfn";
import chai from "chai";
import link from "../src/link.js";
const { assert } = chai;

describe("link", () => {
  it("can replace keys in a parsed tree with the functions to apply", () => {
    // Here, `parsed` maches output format from parse().
    const parsed = ["fn", ["fn", "a", "b"]];

    function fn() {}
    const scope = Explorable({
      fn: fn, // Maps string key "fn" to `fn` function defined above.
    });
    const linked = link(parsed, scope);
    assert.deepEqual(linked, [fn, [fn, "a", "b"]]);
  });
});
