import assert from "node:assert";
import { describe, test } from "node:test";
import reverse from "../../src/operations/reverse.js";
import SampleAsyncMap from "../SampleAsyncMap.js";

describe("reverse", () => {
  test("reverses a sync map's top-level keys", () => {
    const map = {
      a: "A",
      b: "B",
      c: "C",
    };
    const reversed = reverse(map);
    assert.deepEqual(Array.from(reversed.keys()), ["c", "b", "a"]);
    assert.deepEqual(Array.from(reversed.values()), ["C", "B", "A"]);
  });

  test("reverses an async map's top-level keys", async () => {
    const map = new SampleAsyncMap([
      ["a", "A"],
      ["b", "B"],
      ["c", "C"],
    ]);
    const reversed = reverse(map);
    assert.deepEqual(await Array.fromAsync(reversed.keys()), ["c", "b", "a"]);
    assert.deepEqual(await Array.fromAsync(reversed.values()), ["C", "B", "A"]);
  });
});
