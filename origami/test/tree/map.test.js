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
    const array = [
      { name: "Alice", age: 1 },
      { name: "Bob", age: 2 },
      { name: "Carol", age: 3 },
    ];
    const fixture = await map.call(null, array, {
      key: (value, key, tree) => value.name,
      value: (value, key, tree) => value.age,
    });
    assert.deepEqual(await Tree.plain(fixture), {
      Alice: 1,
      Bob: 2,
      Carol: 3,
    });
    assert.deepEqual(await fixture.get("Alice"), 1);
  });

  test("can add an extension to a key", async () => {
    const treelike = {
      "file0.txt": 1,
      file1: 2,
      file2: 3,
    };
    const fixture = await map.call(null, treelike, {
      extension: "->.data",
    });
    assert.deepEqual(await Tree.plain(fixture), {
      "file0.txt.data": 1,
      "file1.data": 2,
      "file2.data": 3,
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
});
