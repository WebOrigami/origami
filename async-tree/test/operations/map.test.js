import assert from "node:assert";
import { describe, test } from "node:test";
import { DeepObjectTree, ObjectTree, Tree } from "../../src/internal.js";
import map from "../../src/operations/map.js";
import * as trailingSlash from "../../src/trailingSlash.js";

describe("map", () => {
  test("throws if no key or value function is supplied", async () => {
    const tree = {
      a: "letter a",
      b: "letter b",
    };
    assert.rejects(async () => {
      await map(tree, {});
    });
  });

  test("maps values", async () => {
    const tree = new ObjectTree({
      a: "letter a",
      b: "letter b",
      c: undefined, // Won't be mapped
    });
    const mapped = await map(tree, {
      value: (sourceValue, sourceKey, innerTree) => {
        assert(sourceKey === "a" || sourceKey === "b");
        assert.equal(innerTree, tree);
        return sourceValue.toUpperCase();
      },
    });
    assert.deepEqual(await Tree.plain(mapped), {
      a: "LETTER A",
      b: "LETTER B",
      c: undefined,
    });
  });

  test("interprets a single function argument as the value function", async () => {
    const tree = {
      a: "letter a",
      b: "letter b",
    };
    const uppercaseValues = await map(tree, (sourceValue, sourceKey, tree) => {
      assert(sourceKey === "a" || sourceKey === "b");
      return sourceValue.toUpperCase();
    });
    assert.deepEqual(await Tree.plain(uppercaseValues), {
      a: "LETTER A",
      b: "LETTER B",
    });
  });

  test("maps keys using key and inverseKey", async () => {
    const tree = {
      a: "letter a",
      b: "letter b",
    };
    const underscoreKeys = await map(tree, {
      key: addUnderscore,
      inverseKey: removeUnderscore,
    });
    assert.deepEqual(await Tree.plain(underscoreKeys), {
      _a: "letter a",
      _b: "letter b",
    });
  });

  test("if only given a key, will generate an inverseKey", async () => {
    const tree = {
      a: "letter a",
      b: "letter b",
    };
    const underscoreKeys = await map(tree, {
      key: addUnderscore,
    });
    assert.deepEqual(await Tree.plain(underscoreKeys), {
      _a: "letter a",
      _b: "letter b",
    });
  });

  test("maps keys and values", async () => {
    const treelike = new ObjectTree([
      { name: "Alice", age: 1 },
      { name: "Bob", age: 2 },
      { name: "Carol", age: 3 },
    ]);
    const result = await map(treelike, {
      key: (value, key, tree) => value.name,
      value: (value, key, tree) => value.age,
    });
    assert.deepEqual(await Tree.plain(result), {
      Alice: 1,
      Bob: 2,
      Carol: 3,
    });
  });

  test("a shallow map is applied to async subtrees too", async () => {
    const tree = {
      a: "letter a",
      more: {
        b: "letter b",
      },
    };
    const underscoreKeys = await map(tree, {
      key: async (value, sourceKey, tree) => `_${sourceKey}`,
      inverseKey: async (resultKey, tree) => resultKey.slice(1),
      value: async (sourceValue, sourceKey, tree) => sourceKey,
    });
    assert.deepEqual(await Tree.plain(underscoreKeys), {
      _a: "a",
      _more: "more",
    });
  });

  test("value can provide a default key and inverse key sidecar functions", async () => {
    const uppercase = (s) => s.toUpperCase();
    uppercase.key = addUnderscore;
    uppercase.inverseKey = removeUnderscore;
    const tree = {
      a: "letter a",
      b: "letter b",
    };
    const mapped = await map(tree, uppercase);
    assert.deepEqual(await Tree.plain(mapped), {
      _a: "LETTER A",
      _b: "LETTER B",
    });
  });

  test("deep maps values", async () => {
    const tree = new DeepObjectTree({
      a: "letter a",
      more: {
        b: "letter b",
      },
    });
    const uppercaseValues = await map(tree, {
      deep: true,
      value: (sourceValue, sourceKey, tree) => sourceValue.toUpperCase(),
    });
    assert.deepEqual(await Tree.plain(uppercaseValues), {
      a: "LETTER A",
      more: {
        b: "LETTER B",
      },
    });
  });

  test("deep maps leaf keys", async () => {
    const tree = new DeepObjectTree({
      a: "letter a",
      more: {
        b: "letter b",
      },
    });
    const underscoreKeys = await map(tree, {
      deep: true,
      key: addUnderscore,
      inverseKey: removeUnderscore,
    });
    assert.deepEqual(await Tree.plain(underscoreKeys), {
      _a: "letter a",
      more: {
        _b: "letter b",
      },
    });
  });

  test("deep maps leaf keys and values", async () => {
    const tree = new DeepObjectTree({
      a: "letter a",
      more: {
        b: "letter b",
      },
    });
    const underscoreKeysUppercaseValues = await map(tree, {
      deep: true,
      key: addUnderscore,
      inverseKey: removeUnderscore,
      value: async (sourceValue, sourceKey, tree) => sourceValue.toUpperCase(),
    });
    assert.deepEqual(await Tree.plain(underscoreKeysUppercaseValues), {
      _a: "LETTER A",
      more: {
        _b: "LETTER B",
      },
    });
  });

  test("keyNeedsSourceValue can be set to false in cases where the value isn't necessary", async () => {
    const tree = {
      a: "letter a",
      b: "letter b",
      c: "letter c",
    };
    const mapped = await map(tree, {
      keyNeedsSourceValue: false,
      key: (value, key) => {
        assert.equal(value, null);
        return key.toUpperCase();
      },
    });
    assert.deepEqual(await Tree.plain(mapped), {
      A: "letter a",
      B: "letter b",
      C: "letter c",
    });
  });

  test("can add an extension to a key", async () => {
    const treelike = {
      "file0.txt": 1,
      file1: 2,
      file2: 3,
    };
    const fixture = await map(treelike, {
      extension: "->.data",
    });
    assert.deepEqual(await Tree.plain(fixture), {
      "file0.txt.data": 1,
      "file1.data": 2,
      "file2.data": 3,
    });
  });

  test("can change a key's extension", async () => {
    const treelike = {
      "file1.lower": "will be mapped",
      file2: "won't be mapped",
      "file3.foo": "won't be mapped",
    };
    const fixture = await map(treelike, {
      extension: ".lower->.upper",
      value: (sourceValue) => sourceValue.toUpperCase(),
    });
    assert.deepEqual(await Tree.plain(fixture), {
      "file1.upper": "WILL BE MAPPED",
    });
  });

  test("can manipulate extensions deeply", async () => {
    const treelike = {
      "file1.txt": 1,
      more: {
        "file2.txt": 2,
      },
    };
    const fixture = await map(treelike, {
      deep: true,
      extension: ".txt->",
    });
    assert.deepEqual(await Tree.plain(fixture), {
      file1: 1,
      more: {
        file2: 2,
      },
    });
  });
});

function addUnderscore(value, key) {
  return `_${key}`;
}

function removeUnderscore(key) {
  return trailingSlash.has(key) ? key : key.slice(1);
}
