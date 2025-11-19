import assert from "node:assert";
import { describe, test } from "node:test";
import set from "../../src/operations/set.js";

describe("set", () => {
  test("sets a value", async () => {
    const map = new Map();
    await set(map, "key", "value");
    assert.strictEqual(map.get("key"), "value");
  });
});
