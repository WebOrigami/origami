import assert from "node:assert";
import { describe, test } from "node:test";
import ifBuiltin from "../../src/builtins/@if.js";

describe("if", () => {
  test("conditionally returns a value", async () => {
    assert.equal(await ifBuiltin.call(null, true, "true"), "true");
    assert.equal(await ifBuiltin.call(null, false, "true"), undefined);
    assert.equal(await ifBuiltin.call(null, false, "true", "false"), "false");
  });
});
