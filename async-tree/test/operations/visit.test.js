import assert from "node:assert";
import { describe, test } from "node:test";
import FunctionMap from "../../src/drivers/FunctionMap.js";
import visit from "../../src/operations/visit.js";

describe("visit", () => {
  test("visits every node in the tree", async () => {
    const values = [];
    const map = new FunctionMap(
      (key) => {
        const value = `value for ${key}`;
        values.push(value);
        return value;
      },
      ["a", "b", "c"]
    );
    const result = await visit(map);
    assert.strictEqual(result, undefined);
    assert.deepStrictEqual(values, [
      "value for a",
      "value for b",
      "value for c",
    ]);
  });
});
