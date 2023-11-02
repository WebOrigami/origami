import * as Tree from "@graphorigami/async-tree/src/Tree.js";
import assert from "node:assert";
import { describe, test } from "node:test";
import Scope from "../../src/runtime/Scope.js";
import invokeFunctionsTransform from "../../src/runtime/invokeFunctionsTransform2.js";

describe("invokeFunctionsTransform", () => {
  test("get() invokes functions using scope, returns other values as is", async () => {
    const tree = Scope.treeWithScope(
      {
        fn: /** @this {import("@graphorigami/types").AsyncTree} */ function () {
          return this.get("message");
        },
        string: "string",
      },
      {
        message: "Hello",
      }
    );
    const fixture = invokeFunctionsTransform(tree);
    assert.deepEqual(await Tree.plain(fixture), {
      fn: "Hello",
      string: "string",
    });
  });
});
