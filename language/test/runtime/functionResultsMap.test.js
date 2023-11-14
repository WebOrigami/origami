import { Tree } from "@graphorigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import Scope from "../../src/runtime/Scope.js";
import functionResultsMap from "../../src/runtime/functionResultsMap.js";

describe("functionResultsMap", () => {
  test("get() invokes functions using scope, returns other values as is", async () => {
    const scope = {
      message: "Hello",
    };
    const tree = Scope.treeWithScope(
      {
        fn: /** @this {import("@graphorigami/types").AsyncTree} */ function () {
          return this.get("message");
        },
        string: "string",
      },
      scope
    );
    const fixture = functionResultsMap(tree);
    assert.deepEqual(await Tree.plain(fixture), {
      fn: "Hello",
      string: "string",
    });
  });
});
