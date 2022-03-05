import ifBuiltin from "../../src/builtins/if.js";
import assert from "../assert.js";

describe("if", () => {
  it("conditionally returns a value", () => {
    assert.equal(ifBuiltin(true, "true"), "true");
    assert.equal(ifBuiltin(false, "true"), undefined);
    assert.equal(ifBuiltin(false, "true", "false"), "false");
  });
});
