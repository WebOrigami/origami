import assert from "node:assert";
import { describe, test } from "node:test";
import ObjectTree from "../../src/ObjectTree.js";
import * as Tree from "../../src/Tree.js";
import createMapTransform from "../../src/transforms/createMapTransform.js";

describe("createMapTransform", () => {
  test("returns identity graph if no keyFn or valueFn", async () => {
    const tree = new ObjectTree({
      a: "letter a",
      b: "letter b",
    });
    const mapped = createMapTransform({})(tree);
    assert.deepEqual(await Tree.plain(mapped), {
      a: "letter a",
      b: "letter b",
    });
  });

  test("maps values", async () => {
    const tree = new ObjectTree({
      a: "letter a",
      b: "letter b",
    });
    const uppercaseValues = createMapTransform({
      valueFn: (value) => value.toUpperCase(),
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
    const uppercaseKeys = createMapTransform({
      keyFn: async (key) => key.toUpperCase(),
    });
    const mapped = uppercaseKeys(tree);
    assert.deepEqual(await Tree.plain(mapped), {
      A: "letter a",
      B: "letter b",
    });
  });

  test("maps keys using keyFn and innerKeyFn", async () => {
    const tree = new ObjectTree({
      a: "letter a",
      b: "letter b",
    });
    const uppercaseKeys = createMapTransform({
      keyFn: async (key) => key.toUpperCase(),
      innerKeyFn: async (key) => key.toLowerCase(),
    });
    const mapped = uppercaseKeys(tree);
    assert.deepEqual(await Tree.plain(mapped), {
      A: "letter a",
      B: "letter b",
    });
  });

  test("maps keys and values", async () => {
    const tree = new ObjectTree({
      a: "letter a",
      b: "letter b",
    });
    const uppercaseKeysValues = createMapTransform({
      keyFn: (key) => key.toUpperCase(),
      valueFn: async (value) => value.toUpperCase(),
    });
    const mapped = uppercaseKeysValues(tree);
    assert.deepEqual(await Tree.plain(mapped), {
      A: "LETTER A",
      B: "LETTER B",
    });
  });

  test("deep maps values", async () => {
    const tree = new ObjectTree({
      a: "letter a",
      more: {
        b: "letter b",
      },
    });
    const uppercaseValues = createMapTransform({
      deep: true,
      valueFn: (value) => value.toUpperCase(),
    });
    const mapped = uppercaseValues(tree);
    assert.deepEqual(await Tree.plain(mapped), {
      a: "LETTER A",
      more: {
        b: "LETTER B",
      },
    });
  });

  test("deep maps keys", async () => {
    const tree = new ObjectTree({
      a: "letter a",
      more: {
        b: "letter b",
      },
    });
    const uppercaseKeys = createMapTransform({
      deep: true,
      keyFn: async (key) => key.toUpperCase(),
    });
    const mapped = uppercaseKeys(tree);
    assert.deepEqual(await Tree.plain(mapped), {
      A: "letter a",
      MORE: {
        B: "letter b",
      },
    });
  });

  test("deep maps keys and values", async () => {
    const tree = new ObjectTree({
      a: "letter a",
      more: {
        b: "letter b",
      },
    });
    const uppercaseKeysValues = createMapTransform({
      deep: true,
      keyFn: (key) => key.toUpperCase(),
      valueFn: async (value) => value.toUpperCase(),
    });
    const mapped = uppercaseKeysValues(tree);
    assert.deepEqual(await Tree.plain(mapped), {
      A: "LETTER A",
      MORE: {
        B: "LETTER B",
      },
    });
  });
});
