import ifBuiltin from "../../src/builtins/if.js";
import assert from "../assert.js";

describe("if", () => {
  it("conditionally returns a value", async () => {
    assert.equal(await ifBuiltin(true, "true"), "true");
    assert.equal(await ifBuiltin(false, "true"), undefined);
    assert.equal(await ifBuiltin(false, "true", "false"), "false");
  });
});
