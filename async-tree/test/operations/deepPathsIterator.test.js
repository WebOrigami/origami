import assert from "node:assert";
import { describe, test } from "node:test";
import deepPathsIterator from "../../src/operations/deepPathsIterator.js";

describe("deepPathsIterator", () => {
  test("yields the paths in the tree", async () => {
    const tree = {
      a: 1,
      b: 2,
      more: {
        c: 3,
        sub: {
          d: 4,
        },
      },
    };

    const paths = [];
    for await (const path of deepPathsIterator(tree)) {
      paths.push(path);
    }
    assert.deepEqual(paths, ["a", "b", "more/c", "more/sub/d"]);
  });
});
