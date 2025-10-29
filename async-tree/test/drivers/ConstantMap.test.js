import assert from "node:assert";
import { describe, test } from "node:test";
import ConstantMap from "../../src/drivers/ConstantMap.js";
import keys from "../../src/operations/keys.js";
import traverse from "../../src/operations/traverse.js";

describe("ConstantMap", () => {
  test("returns a deep tree that returns constant for all keys", async () => {
    const fixture = new ConstantMap(1);
    assert.deepEqual(Array.from(await keys(fixture)), []);
    assert.equal(fixture.get("a"), 1);
    assert.equal(fixture.get("b"), 1);
    assert.equal(await traverse(fixture, "c/", "d/", "e"), 1);
  });
});
