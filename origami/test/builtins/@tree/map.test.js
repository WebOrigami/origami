import { Tree } from "@graphorigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import map from "../../../src/builtins/@tree/map.js";

describe("@tree/map", () => {
  test("gives value and key to both keyFn and valueFn", async () => {
    const treelike = [
      { name: "Alice", age: 1 },
      { name: "Bob", age: 2 },
      { name: "Carol", age: 3 },
    ];
    const fixture = map.call(null, {
      /** @this {import("@graphorigami/types").AsyncTree} */
      keyFn: function (key) {
        return Tree.traverse(this, "_", "name");
      },
      valueFn: (value) => value.get("age"),
    })(treelike);
    assert.deepEqual(await Tree.plain(fixture), {
      Alice: 1,
      Bob: 2,
      Carol: 3,
    });
  });
});
