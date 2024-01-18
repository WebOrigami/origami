import { DeepObjectTree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import paths from "../../../src/builtins/@tree/paths.js";

describe("@tree/paths", () => {
  test("returns an array of paths to the values in the tree", async () => {
    const tree = new DeepObjectTree({
      a: 1,
      b: 2,
      c: {
        d: 3,
        e: 4,
      },
    });
    assert.deepEqual(await paths.call(null, tree), ["a", "b", "c/d", "c/e"]);
  });
});
