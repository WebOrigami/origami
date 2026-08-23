import assert from "node:assert";
import { describe, test } from "node:test";
import paths from "../../src/operations/paths.js";

describe("paths", () => {
  test("returns an array of paths to the values in the tree", async () => {
    const tree = new /** @type {any} */ (Map)([
      ["a", 1],
      ["b", 2],
      [
        "c",
        new Map([
          ["d", 3],
          ["e", 4],
        ]),
      ],
    ]);
    assert.deepEqual(await paths(tree), ["a", "b", "c/d", "c/e"]);
  });
});
