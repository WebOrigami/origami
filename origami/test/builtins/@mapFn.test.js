import { DeepObjectTree, ObjectTree, Tree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import mapFn from "../../src/builtins/@mapFn.js";

describe("@mapFn", () => {
  test("puts value and key in scope", async () => {
    const treelike = new ObjectTree([
      { name: "Alice", age: 1 },
      { name: "Bob", age: 2 },
      { name: "Carol", age: 3 },
    ]);
    const transform = mapFn.call(null, {
      key: (value, key, tree) => value.name,
      value: (value, key, tree) => value.age,
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
    const transform = mapFn.call(null, {
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
    const transform = mapFn.call(null, {
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
    const transform = mapFn.call(null, {
      deep: true,
      key: (sourceValue, sourceKey, tree) => `${sourceKey}${sourceValue}`,
      // @ts-ignore until we can figure out why @satisfies doesn't fix this type error
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
    const transform = mapFn.call(null, {
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
