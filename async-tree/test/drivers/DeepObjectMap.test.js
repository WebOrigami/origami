import assert from "node:assert";
import { describe, test } from "node:test";
import DeepObjectMap from "../../src/drivers/DeepObjectMap.js";
import plain from "../../src/operations/plain.js";

describe("DeepObjectMap", () => {
  test("returns a map for a value that's a plain sub-object or sub-array", async () => {
    const map = createFixture();

    const object = await map.get("object");
    assert.equal(object instanceof DeepObjectMap, true);
    assert.deepEqual(await plain(object), { b: 2 });
    assert.equal(object.parent, map);

    const array = await map.get("array");
    assert.equal(array instanceof DeepObjectMap, true);
    assert.deepEqual(await plain(array), [3]);
    assert.equal(array.parent, map);
  });

  test("adds trailing slashes to keys for submaps including plain objects or arrays", async () => {
    const map = createFixture();
    const keys = Array.from(await map.keys());
    assert.deepEqual(keys, ["a", "object/", "array/"]);
  });
});

function createFixture() {
  return new DeepObjectMap({
    a: 1,
    object: {
      b: 2,
    },
    array: [3],
  });
}
