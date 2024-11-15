import assert from "node:assert";
import { describe, test } from "node:test";
import FunctionTree from "../../src/drivers/FunctionTree.js";
import { DeepObjectTree, ObjectTree, Tree } from "../../src/internal.js";
import map from "../../src/operations/map.js";
import * as trailingSlash from "../../src/trailingSlash.js";

describe("map", () => {
  test("returns identity graph if no key or value function is supplied", async () => {
    const tree = {
      a: "letter a",
      b: "letter b",
    };
    const mapped = map(tree, {});
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
    const mapped = map(tree, {
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
    const uppercaseValues = map(tree, (sourceValue, sourceKey, tree) => {
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
    const underscoreKeys = map(tree, {
      key: addUnderscore,
      inverseKey: removeUnderscore,
    });
    assert.deepEqual(await Tree.plain(underscoreKeys), {
      _a: "letter a",
      _b: "letter b",
    });
  });

  test("maps keys and values", async () => {
    const tree = {
      a: "letter a",
      b: "letter b",
    };
    const underscoreKeysUppercaseValues = map(tree, {
      key: addUnderscore,
      inverseKey: removeUnderscore,
      value: async (sourceValue, sourceKey, tree) => sourceValue.toUpperCase(),
    });
    assert.deepEqual(await Tree.plain(underscoreKeysUppercaseValues), {
      _a: "LETTER A",
      _b: "LETTER B",
    });
  });

  test("a shallow map is applied to async subtrees too", async () => {
    const tree = {
      a: "letter a",
      more: {
        b: "letter b",
      },
    };
    const underscoreKeys = map(tree, {
      key: async (sourceKey, tree) => `_${sourceKey}`,
      inverseKey: async (resultKey, tree) => resultKey.slice(1),
      value: async (sourceValue, sourceKey, tree) => sourceKey,
    });
    assert.deepEqual(await Tree.plain(underscoreKeys), {
      _a: "a",
      _more: "more",
    });
  });

  test("value can provide a default key and inverse key functions", async () => {
    const uppercase = (s) => s.toUpperCase();
    uppercase.key = addUnderscore;
    uppercase.inverseKey = removeUnderscore;
    const tree = {
      a: "letter a",
      b: "letter b",
    };
    const mapped = map(tree, uppercase);
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
    const uppercaseValues = map(tree, {
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
    const underscoreKeys = map(tree, {
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
    const underscoreKeysUppercaseValues = map(tree, {
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

  test("needsSourceValue can be set to false in cases where the value isn't necessary", async () => {
    let flag = false;
    const tree = new FunctionTree(() => {
      flag = true;
    }, ["a", "b", "c"]);
    const mapped = map(tree, {
      needsSourceValue: false,
      value: () => "X",
    });
    assert.deepEqual(await Tree.plain(mapped), {
      a: "X",
      b: "X",
      c: "X",
    });
    assert(!flag);
  });
});

function addUnderscore(key) {
  return `_${key}`;
}

function removeUnderscore(key) {
  return trailingSlash.has(key) ? key : key.slice(1);
}
