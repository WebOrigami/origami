import assert from "node:assert";
import { describe, test } from "node:test";
import ObjectTree from "../../src/ObjectTree.js";
import * as Tree from "../../src/Tree.js";
import map from "../../src/transforms/map.js";

describe("map", () => {
  test("returns identity graph if no keyMap or valueMap", async () => {
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
      valueMap: (sourceValue, sourceKey, innerTree) => {
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

  test("maps keys using keyMap and inverseKeyMap", async () => {
    const tree = new ObjectTree({
      a: "letter a",
      b: "letter b",
    });
    const doubleKeys = map({
      keyMap: async (sourceKey, tree) => `_${sourceKey}`,
      inverseKeyMap: async (resultKey, tree) => resultKey.slice(1),
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
      keyMap: async (sourceKey, tree) => `_${sourceKey}`,
      inverseKeyMap: async (resultKey, tree) => resultKey.slice(1),
      valueMap: async (sourceValue, sourceKey, tree) =>
        sourceValue.toUpperCase(),
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
      keyMap: async (sourceKey, tree) => `_${sourceKey}`,
      inverseKeyMap: async (resultKey, tree) => resultKey.slice(1),
      valueMap: async (sourceValue, sourceKey, tree) => sourceKey,
    });
    const mapped = doubleKeys(tree);
    assert.deepEqual(await Tree.plain(mapped), {
      _a: "a",
      _more: "more",
    });
  });

  test("valueMap can provide a default keyMap and inverseKeyMap", async () => {
    const uppercase = (s) => s.toUpperCase();
    uppercase.keyMap = (sourceKey) => `_${sourceKey}`;
    uppercase.inverseKeyMap = (resultKey) => resultKey.slice(1);
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
    const tree = new ObjectTree({
      a: "letter a",
      more: {
        b: "letter b",
      },
    });
    const uppercaseValues = map({
      deep: true,
      valueMap: (sourceValue, sourceKey, tree) => sourceValue.toUpperCase(),
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
    const tree = new ObjectTree({
      a: "letter a",
      more: {
        b: "letter b",
      },
    });
    const doubleKeys = map({
      deep: true,
      keyMap: async (sourceKey, tree) => `_${sourceKey}`,
      inverseKeyMap: async (resultKey, tree) => resultKey.slice(1),
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
    const tree = new ObjectTree({
      a: "letter a",
      more: {
        b: "letter b",
      },
    });
    const doubleKeysUppercaseValues = map({
      deep: true,
      keyMap: async (sourceKey, tree) => `_${sourceKey}`,
      inverseKeyMap: async (resultKey, tree) => resultKey.slice(1),
      valueMap: async (sourceValue, sourceKey, tree) =>
        sourceValue.toUpperCase(),
    });
    const mapped = doubleKeysUppercaseValues(tree);
    assert.deepEqual(await Tree.plain(mapped), {
      _a: "LETTER A",
      more: {
        _b: "LETTER B",
      },
    });
  });
});
