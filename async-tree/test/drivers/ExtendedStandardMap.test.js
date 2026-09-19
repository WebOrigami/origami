import assert from "node:assert";
import { describe, test } from "node:test";
import { ExtendedStandardMap } from "../../src/internal.js";

describe("ExtendedStandardMap", () => {
  test("wraps a standard Map as a SyncMap", async () => {
    const map = new Map([
      ["a", 1],
      ["b", 2],
    ]);
    const extendedMap = new ExtendedStandardMap(map);
    // Try a SyncMap instance method
    const reversed = Array.from(extendedMap.keys()).reverse();
    assert.deepStrictEqual(reversed, ["b", "a"]);
  });
});
