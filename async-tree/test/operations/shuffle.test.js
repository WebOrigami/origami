import assert from "node:assert";
import { describe, test } from "node:test";
import { AsyncMap } from "../../src/internal.js";
import keys from "../../src/operations/keys.js";
import shuffle from "../../src/operations/shuffle.js";
import SampleAsyncMap from "../SampleAsyncMap.js";

describe("shuffle", () => {
  test("shuffles the keys of a sync map", () => {
    const obj = {
      a: 1,
      b: 2,
      c: 3,
      d: 4,
      e: 5,
    };
    const result = shuffle(obj);
    assert(result instanceof Map);
    const treeKeys = Array.from(result.keys());
    assert.deepEqual(treeKeys.sort(), Object.keys(obj).sort());
  });

  test("shuffles the keys of an async map", async () => {
    const obj = {
      a: 1,
      b: 2,
      c: 3,
      d: 4,
      e: 5,
    };
    const asyncMap = new SampleAsyncMap(Object.entries(obj));
    const result = shuffle(asyncMap);
    assert(result instanceof AsyncMap);
    const treeKeys = await Array.fromAsync(result.keys());
    assert.deepEqual(treeKeys.sort(), Object.keys(obj).sort());
  });

  test("accepts a randoms function for deterministic shuffling", async () => {
    const obj = {
      a: 1,
      b: 2,
      c: 3,
      d: 4,
      e: 5,
    };

    function count() {
      let index = 0;
      return function () {
        return index++;
      };
    }

    const result1 = shuffle(obj, { randoms: count() });
    const keys1 = await keys(result1);

    const result2 = shuffle(obj, { randoms: count() });
    const keys2 = await keys(result2);

    assert.deepEqual(keys1, keys2);
  });
});
