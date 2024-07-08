import { ObjectTree, Tree, scope } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import functionResultsMap from "../../src/runtime/functionResultsMap.js";

describe("functionResultsMap", () => {
  test("get() invokes functions using scope, returns other values as is", async () => {
    const parent = new ObjectTree({
      message: "Hello",
    });
    const tree = new ObjectTree({
      fn: /** @this {import("@weborigami/types").AsyncTree} */ function () {
        return scope(this).get("message");
      },
      string: "string",
    });
    tree.parent = parent;
    const fixture = functionResultsMap(tree);
    assert.deepEqual(await Tree.plain(fixture), {
      fn: "Hello",
      string: "string",
    });
  });
});
