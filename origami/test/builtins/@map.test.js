import { ObjectTree, Tree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import map from "../../src/builtins/@map.js";

describe("@map", () => {
  test("applies a transform to a tree", async () => {
    const treelike = new ObjectTree([
      { name: "Alice", age: 1 },
      { name: "Bob", age: 2 },
      { name: "Carol", age: 3 },
    ]);
    const result = map.call(null, treelike, {
      /** @this {import("@weborigami/types").AsyncTree} */
      key: async function (sourceValue, sourceKey, tree) {
        const keyInScope = await this.get("@key");
        assert.equal(keyInScope, sourceKey);
        const valueInScope = await this.get("_");
        assert.equal(valueInScope, sourceValue);
        return valueInScope.name;
      },
      value: (sourceValue, sourceKey, tree) => sourceValue.age,
    });
    assert.deepEqual(await Tree.plain(result), {
      Alice: 1,
      Bob: 2,
      Carol: 3,
    });
  });
});
