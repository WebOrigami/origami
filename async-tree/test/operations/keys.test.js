import assert from "node:assert";
import { describe, test } from "node:test";
import { AsyncMap, ObjectMap } from "../../src/internal.js";
import keys from "../../src/operations/keys.js";

describe("keys", () => {
  test("handles regular iterable", () => {
    const obj = new ObjectMap({
      a: 1,
      b: 2,
      c: 3,
    });
    const result = keys(obj);
    assert.deepEqual(result, ["a", "b", "c"]);
  });

  test("handles async iterable", async () => {
    const map = new AsyncMap();
    map.keys = async function* () {
      yield "x";
      yield "y";
      yield "z";
    };
    const promise = keys(map);
    const result = await promise;
    assert.deepEqual(result, ["x", "y", "z"]);
  });
});
