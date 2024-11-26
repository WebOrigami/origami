import assert from "node:assert";
import { describe, test } from "node:test";
import * as calc from "../../src/calc/calc.js";

describe.skip("calc:", () => {
  test("if conditionally returns a value", async () => {
    assert.equal(await calc.ifBuiltin.call(null, true, "true"), "true");
    assert.equal(await calc.ifBuiltin.call(null, false, "true"), undefined);
    assert.equal(
      await calc.ifBuiltin.call(null, false, "true", "false"),
      "false"
    );
  });
});
