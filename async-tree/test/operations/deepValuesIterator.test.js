import assert from "node:assert";
import { describe, test } from "node:test";
import ObjectMap from "../../src/drivers/ObjectMap.js";
import deepValuesIterator from "../../src/operations/deepValuesIterator.js";

describe("deepValuesIterator", () => {
  test("returns an iterator of a tree's deep values", async () => {
    const tree = new ObjectMap({
      a: 1,
      b: 2,
      more: {
        c: 3,
        d: 4,
      },
    });
    const values = [];
    // The tree will be shallow, but we'll ask to expand the values.
    for await (const value of deepValuesIterator(tree, { expand: true })) {
      values.push(value);
    }
    assert.deepEqual(values, [1, 2, 3, 4]);
  });
});
