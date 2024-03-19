import assert from "node:assert";
import { describe, test } from "node:test";
import DeepObjectTree from "../../src/DeepObjectTree.js";
import FunctionTree from "../../src/FunctionTree.js";
import ObjectTree from "../../src/ObjectTree.js";
import * as Tree from "../../src/Tree.js";
import map from "../../src/transforms/map.js";

describe("map", () => {
  test("returns identity graph if no key or value", async () => {
    const tree = new ObjectTree({
      a: "letter a",
      b: "letter b",
    });
    const mapped = map({})(tree);
    assert.deepEqual(await Tree.plain(mapped), {
      a: "letter a",
      b: "letter b",
    });
  });

  test("maps values", async () => {
    const tree = new ObjectTree({
      a: "letter a",
      b: "letter b",
      c: undefined, // Won't be mapped
    });
    const uppercaseValues = map({
      value: (sourceValue, sourceKey, innerTree) => {
        assert(sourceKey === "a" || sourceKey === "b");
        assert.equal(innerTree, tree);
        return sourceValue.toUpperCase();
      },
    });
    const mapped = uppercaseValues(tree);
    assert.deepEqual(await Tree.plain(mapped), {
      a: "LETTER A",
      b: "LETTER B",
      c: undefined,
    });
  });

  test("interprets a single function argument as the value function", async () => {
    const tree = new ObjectTree({
      a: "letter a",
      b: "letter b",
    });
    const uppercaseValues = map((sourceValue, sourceKey, innerTree) => {
      assert(sourceKey === "a" || sourceKey === "b");
      assert.equal(innerTree, tree);
      return sourceValue.toUpperCase();
    });
    const mapped = uppercaseValues(tree);
    assert.deepEqual(await Tree.plain(mapped), {
      a: "LETTER A",
      b: "LETTER B",
    });
  });

  test("maps keys using key and inverseKey", async () => {
    const tree = new ObjectTree({
      a: "letter a",
      b: "letter b",
    });
    const doubleKeys = map({
      key: async (sourceKey, tree) => `_${sourceKey}`,
      inverseKey: async (resultKey, tree) => resultKey.slice(1),
    });
    const mapped = doubleKeys(tree);
    assert.deepEqual(await Tree.plain(mapped), {
      _a: "letter a",
      _b: "letter b",
    });
  });

  test("maps keys and values", async () => {
    const tree = new ObjectTree({
      a: "letter a",
      b: "letter b",
    });
    const doubleKeysUppercaseValues = map({
      key: async (sourceKey, tree) => `_${sourceKey}`,
      inverseKey: async (resultKey, tree) => resultKey.slice(1),
      value: async (sourceValue, sourceKey, tree) => sourceValue.toUpperCase(),
    });
    const mapped = doubleKeysUppercaseValues(tree);
    assert.deepEqual(await Tree.plain(mapped), {
      _a: "LETTER A",
      _b: "LETTER B",
    });
  });

  test("a shallow map is applied to async subtrees too", async () => {
    const tree = new ObjectTree({
      a: "letter a",
      more: {
        b: "letter b",
      },
    });
    const doubleKeys = map({
      key: async (sourceKey, tree) => `_${sourceKey}`,
      inverseKey: async (resultKey, tree) => resultKey.slice(1),
      value: async (sourceValue, sourceKey, tree) => sourceKey,
    });
    const mapped = doubleKeys(tree);
    assert.deepEqual(await Tree.plain(mapped), {
      _a: "a",
      _more: "more",
    });
  });

  test("value can provide a default key and inverse key functions", async () => {
    const uppercase = (s) => s.toUpperCase();
    uppercase.key = (sourceKey) => `_${sourceKey}`;
    uppercase.inverseKey = (resultKey) => resultKey.slice(1);
    const tree = new ObjectTree({
      a: "letter a",
      b: "letter b",
    });
    const mapped = map(uppercase)(tree);
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
    const uppercaseValues = map({
      deep: true,
      value: (sourceValue, sourceKey, tree) => sourceValue.toUpperCase(),
    });
    const mapped = uppercaseValues(tree);
    assert.deepEqual(await Tree.plain(mapped), {
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
    const doubleKeys = map({
      deep: true,
      key: async (sourceKey, tree) => `_${sourceKey}`,
      inverseKey: async (resultKey, tree) => resultKey.slice(1),
    });
    const mapped = doubleKeys(tree);
    assert.deepEqual(await Tree.plain(mapped), {
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
    const doubleKeysUppercaseValues = map({
      deep: true,
      key: async (sourceKey, tree) => `_${sourceKey}`,
      inverseKey: async (resultKey, tree) => resultKey.slice(1),
      value: async (sourceValue, sourceKey, tree) => sourceValue.toUpperCase(),
    });
    const mapped = doubleKeysUppercaseValues(tree);
    assert.deepEqual(await Tree.plain(mapped), {
      _a: "LETTER A",
      more: {
        _b: "LETTER B",
      },
    });
  });

  test("needsSourceValue can be set to false in cases where the value isn't necessary", async () => {
    let flag = false;
    const tree = new FunctionTree(() => {
      flag = true;
    }, ["a", "b", "c"]);
    const mapped = map({
      needsSourceValue: false,
      value: () => "X",
    })(tree);
    assert.deepEqual(await Tree.plain(mapped), {
      a: "X",
      b: "X",
      c: "X",
    });
    assert(!flag);
  });
});
