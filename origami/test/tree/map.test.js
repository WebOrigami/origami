import { DeepObjectTree, ObjectTree, Tree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import map from "../../src/tree/map.js";

describe("map", () => {
  test("applies a transform to a tree", async () => {
    const treelike = new ObjectTree([
      { name: "Alice", age: 1 },
      { name: "Bob", age: 2 },
      { name: "Carol", age: 3 },
    ]);
    const result = await map.call(null, treelike, {
      key: (value, key, tree) => value.name,
      value: (value, key, tree) => value.age,
    });
    assert.deepEqual(await Tree.plain(result), {
      Alice: 1,
      Bob: 2,
      Carol: 3,
    });
  });

  test("passes value and key to functions", async () => {
    const treelike = new ObjectTree([
      { name: "Alice", age: 1 },
      { name: "Bob", age: 2 },
      { name: "Carol", age: 3 },
    ]);
    const fixture = await map.call(null, treelike, {
      key: (value, key, tree) => value.name,
      value: (value, key, tree) => value.age,
    });
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
    const fixture = await map.call(null, treelike, {
      extension: "txt->upper",
      value: (sourceValue, sourceKey, tree) => sourceValue.toUpperCase(),
    });
    assert.deepEqual(await Tree.plain(fixture), {
      "file1.upper": "WILL BE MAPPED",
    });
  });

  test("can remove a key's extension", async () => {
    const treelike = {
      "file1.txt": 1,
      "file2.txt": 2,
    };
    const fixture = await map.call(null, treelike, {
      extension: "txt->",
    });
    assert.deepEqual(await Tree.plain(fixture), {
      file1: 1,
      file2: 2,
    });
  });

  test("can map keys and values deeply", async () => {
    const treelike = new DeepObjectTree({
      a: 1,
      more: {
        b: 2,
      },
    });
    const fixture = await map.call(null, treelike, {
      deep: true,
      key: (sourceValue, sourceKey, tree) => `${sourceKey}${sourceValue}`,
      value: (sourceValue, sourceKey, tree) => 2 * sourceValue,
    });
    assert.deepEqual(await Tree.plain(fixture), {
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
    const fixture = await map.call(null, treelike, {
      deep: true,
      key: (sourceValue, sourceKey, tree) => `${sourceKey}${sourceValue}`,
      // @ts-ignore until we can figure out why @satisfies doesn't fix this type error
      value: (sourceValue, sourceKey, tree) => 2 * sourceValue,
    });
    assert.deepEqual(await Tree.plain(fixture), {
      a1: 2,
      more: {
        b2: 4,
      },
    });
  });

  test("can map extensions deeply", async () => {
    const treelike = new DeepObjectTree({
      "file1.txt": "will be mapped",
      file2: "won't be mapped",
      "file3.foo": "won't be mapped",
      more: {
        "file4.txt": "will be mapped",
        "file5.bar": "won't be mapped",
      },
    });
    const fixture = await map.call(null, treelike, {
      deep: true,
      extension: "txt->upper",
      value: (sourceValue, sourceKey, tree) => sourceValue.toUpperCase(),
    });
    assert.deepEqual(await Tree.plain(fixture), {
      "file1.upper": "WILL BE MAPPED",
      more: {
        "file4.upper": "WILL BE MAPPED",
      },
    });
  });
});
