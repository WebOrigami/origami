import assert from "node:assert";
import { describe, test } from "node:test";
import deepEntries from "../../src/operations/deepEntries.js";
import SampleAsyncMap from "../SampleAsyncMap.js";

describe("deepEntries", () => {
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
    const result = await deepEntries(fixture);
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
