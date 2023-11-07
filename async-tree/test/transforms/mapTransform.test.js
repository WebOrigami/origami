import assert from "node:assert";
import { describe, test } from "node:test";
import ObjectTree from "../../src/ObjectTree.js";
import * as Tree from "../../src/Tree.js";
import mapTransform from "../../src/transforms/mapTransform.js";

describe("mapTransform", () => {
  test("returns identity graph if no keyFn or valueFn", async () => {
    const tree = new ObjectTree({
      a: "letter a",
      b: "letter b",
    });
    const mapped = mapTransform({})(tree);
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
    const uppercaseValues = mapTransform({
      valueFn: (innerValue, innerKey, innerTree) => {
        assert(innerKey === "a" || innerKey === "b");
        assert.equal(innerTree, tree);
        return innerValue.toUpperCase();
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
    const uppercaseValues = mapTransform((innerValue, innerKey, innerTree) => {
      assert(innerKey === "a" || innerKey === "b");
      assert.equal(innerTree, tree);
      return innerValue.toUpperCase();
    });
    const mapped = uppercaseValues(tree);
    assert.deepEqual(await Tree.plain(mapped), {
      a: "LETTER A",
      b: "LETTER B",
    });
  });

  test("maps keys", async () => {
    const tree = new ObjectTree({
      a: "letter a",
      b: "letter b",
    });
    const doubleKeys = mapTransform({
      keyFn: async (innerValue, innerKey, tree) => `${innerKey}${innerKey}`,
    });
    const mapped = doubleKeys(tree);
    assert.deepEqual(await Tree.plain(mapped), {
      aa: "letter a",
      bb: "letter b",
    });
  });

  test("maps keys using keyFn and innerKeyFn", async () => {
    const tree = new ObjectTree({
      a: "letter a",
      b: "letter b",
    });
    const doubleKeys = mapTransform({
      keyFn: async (innerValue, innerKey, tree) => `${innerKey}${innerKey}`,
      innerKeyFn: async (outerKey) => outerKey.slice(0, 1),
    });
    const mapped = doubleKeys(tree);
    assert.deepEqual(await Tree.plain(mapped), {
      aa: "letter a",
      bb: "letter b",
    });
  });

  test("maps keys and values", async () => {
    const tree = new ObjectTree({
      a: "letter a",
      b: "letter b",
    });
    const doubleKeysUppercaseValues = mapTransform({
      keyFn: async (innerValue, innerKey, tree) => `${innerKey}${innerKey}`,
      valueFn: async (innerValue, innerKey, tree) => innerValue.toUpperCase(),
    });
    const mapped = doubleKeysUppercaseValues(tree);
    assert.deepEqual(await Tree.plain(mapped), {
      aa: "LETTER A",
      bb: "LETTER B",
    });
  });

  test("a shallow map is applied to async subtrees too", async () => {
    const tree = new ObjectTree({
      a: "letter a",
      more: {
        b: "letter b",
      },
    });
    const doubleKeys = mapTransform({
      keyFn: async (innerValue, innerKey, tree) => `${innerKey}${innerKey}`,
      valueFn: async (innerValue, innerKey, tree) => innerKey,
    });
    const mapped = doubleKeys(tree);
    assert.deepEqual(await Tree.plain(mapped), {
      aa: "a",
      moremore: "more",
    });
  });

  test("deep maps values", async () => {
    const tree = new ObjectTree({
      a: "letter a",
      more: {
        b: "letter b",
      },
    });
    const uppercaseValues = mapTransform({
      deep: true,
      valueFn: (innerValue, innerKey, tree) => innerValue.toUpperCase(),
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
    const doubleKeys = mapTransform({
      deep: true,
      keyFn: async (innerValue, innerKey, tree) => `${innerKey}${innerKey}`,
    });
    const mapped = doubleKeys(tree);
    assert.deepEqual(await Tree.plain(mapped), {
      aa: "letter a",
      more: {
        bb: "letter b",
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
    const doubleKeysUppercaseValues = mapTransform({
      deep: true,
      keyFn: async (innerValue, innerKey, tree) => `${innerKey}${innerKey}`,
      valueFn: async (innerValue, innerKey, tree) => innerValue.toUpperCase(),
    });
    const mapped = doubleKeysUppercaseValues(tree);
    assert.deepEqual(await Tree.plain(mapped), {
      aa: "LETTER A",
      more: {
        bb: "LETTER B",
      },
    });
  });
});
