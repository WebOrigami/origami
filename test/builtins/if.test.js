import ifBuiltin from "../../src/builtins/if.js";
import assert from "../assert.js";

describe("if", () => {
  it("conditionally returns a value", async () => {
    assert.equal(await ifBuiltin.call(null, true, "true"), "true");
    assert.equal(await ifBuiltin.call(null, false, "true"), undefined);
    assert.equal(await ifBuiltin.call(null, false, "true", "false"), "false");
  });
});
