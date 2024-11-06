import assert from "node:assert";
import { describe, test } from "node:test";
import calc from "../../src/calc/calc.js";

describe("calc:", () => {
  test("if conditionally returns a value", async () => {
    assert.equal(await calc.if.call(null, true, "true"), "true");
    assert.equal(await calc.if.call(null, false, "true"), undefined);
    assert.equal(await calc.if.call(null, false, "true", "false"), "false");
  });
});
