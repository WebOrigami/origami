import assert from "node:assert";
import { describe, test } from "node:test";
import deepArrays from "../../src/operations/deepArrays.js";
import SampleAsyncMap from "../SampleAsyncMap.js";

describe("deepArrays", () => {
  test("converts an async tree to an array of nested entries arrays", async () => {
    const fixture = new SampleAsyncMap([
      ["a", 1],
      ["b", 2],
      [
        "more",
        [
          ["c", 3],
          ["d", 4],
        ],
      ],
    ]);
    const result = await deepArrays(fixture);
    assert.deepStrictEqual(result, [
      ["a", 1],
      ["b", 2],
      [
        "more",
        [
          ["c", 3],
          ["d", 4],
        ],
      ],
    ]);
  });
});
