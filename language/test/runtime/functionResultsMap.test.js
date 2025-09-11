import { ObjectTree, Tree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import functionResultsMap from "../../src/runtime/functionResultsMap.js";

describe("functionResultsMap", () => {
  test("get() invokes functions, returns other values as is", async () => {
    const tree = new ObjectTree({
      fn: function () {
        return "Hello";
      },
      string: "string",
    });
    const fixture = await functionResultsMap(tree);
    assert.deepEqual(await Tree.plain(fixture), {
      fn: "Hello",
      string: "string",
    });
  });
});
