import { DeepObjectTree, ObjectTree, Tree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import map from "../../src/builtins/@map.js";

describe("@map", () => {
  test("puts value and key in scope", async () => {
    const treelike = new ObjectTree([
      { name: "Alice", age: 1 },
      { name: "Bob", age: 2 },
      { name: "Carol", age: 3 },
    ]);
    const transform = map.call(null, {
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
    const fixture = transform(treelike);
    assert.deepEqual(await Tree.plain(fixture), {
      Alice: 1,
      Bob: 2,
      Carol: 3,
    });
  });

  test("can change a key's extension", async () => {
    const treelike = {
      "file1.txt": "will be mapped",
      file2: "won't be mapped",
      "file3.foo": "won't be mapped",
    };
    const transform = map.call(null, {
      extensions: "txt->upper",
      value: (sourceValue, sourceKey, tree) => sourceValue.toUpperCase(),
    });
    const fixture = transform(treelike);
    assert.deepEqual(await Tree.plain(fixture), {
      "file1.upper": "WILL BE MAPPED",
    });
  });

  test("can map keys and values deeply", async () => {
    const treelike = new DeepObjectTree({
      a: 1,
      more: {
        b: 2,
      },
    });
    const transform = map.call(null, {
      deep: true,
      key: (sourceValue, sourceKey, tree) => `${sourceKey}${sourceValue}`,
      value: (sourceValue, sourceKey, tree) => 2 * sourceValue,
    });
    const mapped = transform(treelike);
    assert.deepEqual(await Tree.plain(mapped), {
      a1: 2,
      more: {
        b2: 4,
      },
    });
  });

  test("can take a treelike source and return the transformed tree", async () => {
    const treelike = new DeepObjectTree({
      a: 1,
      more: {
        b: 2,
      },
    });

    // The map function has two overloads, but TypeScript seems trouble figuring
    // out which one is being used if we use `map.call()` vs a direct `map()`
    // call. Unfortunately, we need to use `.call` to ensure the `this` context
    // is set correctly. For now we ignore the type error.
    const mapped = map.call(
      null,
      {
        deep: true,
        key: (sourceValue, sourceKey, tree) => `${sourceKey}${sourceValue}`,
        // @ts-ignore until we can figure out why @satisfies doesn't fix this type error
        value: (sourceValue, sourceKey, tree) => 2 * sourceValue,
      },
      // @ts-ignore
      treelike
    );

    assert.deepEqual(await Tree.plain(mapped), {
      a1: 2,
      more: {
        b2: 4,
      },
    });
  });

  test("can map extensions deeply", async () => {
    const treelike = {
      "file1.txt": "will be mapped",
      file2: "won't be mapped",
      "file3.foo": "won't be mapped",
      more: {
        "file4.txt": "will be mapped",
        "file5.bar": "won't be mapped",
      },
    };
    const transform = map.call(null, {
      deep: true,
      extensions: "txt->upper",
      value: (sourceValue, sourceKey, tree) => sourceValue.toUpperCase(),
    });
    const fixture = transform(treelike);
    assert.deepEqual(await Tree.plain(fixture), {
      "file1.upper": "WILL BE MAPPED",
      more: {
        "file4.upper": "WILL BE MAPPED",
      },
    });
  });
});
