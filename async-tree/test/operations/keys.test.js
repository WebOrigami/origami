import assert from "node:assert";
import { describe, test } from "node:test";
import AsyncMap from "../../src/drivers/AsyncMap.js";
import ObjectMap from "../../src/drivers/ObjectMap.js";
import keys from "../../src/operations/keys.js";

describe("keys", () => {
  test("handles regular iterable", async () => {
    const obj = new ObjectMap({
      a: 1,
      b: 2,
      c: 3,
    });
    const result = await keys(obj);
    assert.deepEqual(result, ["a", "b", "c"]);
  });

  test("handles async iterable", async () => {
    const map = new AsyncMap();
    map.keys = async function* () {
      yield "x";
      yield "y";
      yield "z";
    };
    const result = await keys(map);
    assert.deepEqual(result, ["x", "y", "z"]);
  });
});
