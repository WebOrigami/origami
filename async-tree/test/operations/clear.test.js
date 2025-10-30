import assert from "node:assert";
import { describe, test } from "node:test";
import ObjectMap from "../../src/drivers/ObjectMap.js";
import clear from "../../src/operations/clear.js";
import plain from "../../src/operations/plain.js";

describe("clear", () => {
  test("unsets all public keys in an object tree", async () => {
    const tree = new ObjectMap({ a: 1, b: 2, c: 3 });
    await clear(tree);
    assert.deepEqual(await plain(tree), {});
  });
});
