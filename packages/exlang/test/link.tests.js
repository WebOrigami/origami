import { Explorable, get } from "@explorablegraph/exfn";
import chai from "chai";
import link from "../src/link.js";
const { assert } = chai;

describe("link", () => {
  it("can replace keys in a parsed tree with the functions to apply", () => {
    function foo() {}
    const parsed = Explorable({
      foo: "arg",
    });
    const scope = Explorable({
      foo, // Include a string key of "foo" that maps to the function above
    });
    const linked = link(parsed, scope);

    // See if the text key "foo" in the parsed tree now appears in the linked
    // tree with a key of the actual function `foo()`.
    const scopedArg = linked[get](foo);
    assert.equal(scopedArg, "arg");
  });
});
