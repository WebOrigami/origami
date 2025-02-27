import assert from "node:assert";
import { describe, test } from "node:test";
import { DeepObjectTree, ObjectTree } from "../../src/internal.js";
import cachedKeyFunctions from "../../src/operations/cachedKeyFunctions.js";
import * as trailingSlash from "../../src/trailingSlash.js";

describe("cachedKeyFunctions", () => {
  test("maps keys with caching", async () => {
    const tree = new ObjectTree({
      a: "letter a",
      b: "letter b",
    });

    let callCount = 0;
    const addUnderscore = async (sourceKey, tree) => {
      callCount++;
      return `_${sourceKey}`;
    };

    const { inverseKey, key } = cachedKeyFunctions(addUnderscore);

    assert.equal(await inverseKey("_a", tree), "a"); // Cache miss
    assert.equal(callCount, 1);
    assert.equal(await inverseKey("_a", tree), "a");
    assert.equal(callCount, 1);
    assert.equal(await inverseKey("_b", tree), "b"); // Cache miss
    assert.equal(callCount, 2);

    assert.equal(await key("a", tree), "_a");
    assert.equal(await key("a", tree), "_a");
    assert.equal(await key("b", tree), "_b");
    assert.equal(callCount, 2);

    // `c` isn't in tree, so we should get undefined.
    assert.equal(await inverseKey("_c", tree), undefined);
    // But key mapping is still possible.
    assert.equal(await key("c", tree), "_c");
    // And now we have a cache hit.
    assert.equal(await inverseKey("_c", tree), "c");
    assert.equal(callCount, 3);
  });

  test("maps keys with caching and deep option", async () => {
    const tree = new DeepObjectTree({
      a: "letter a",
      b: {
        c: "letter c",
      },
    });

    let callCount = 0;
    const addUnderscore = async (sourceKey, tree) => {
      callCount++;
      return `_${sourceKey}`;
    };

    const { inverseKey, key } = cachedKeyFunctions(addUnderscore, true);

    assert.equal(await inverseKey("_a", tree), "a"); // Cache miss
    assert.equal(await inverseKey("_a", tree), "a");
    assert.equal(callCount, 1);

    // Subtree key left alone
    assert.equal(await inverseKey("_b", tree), undefined);
    assert.equal(await inverseKey("b", tree), "b");
    assert.equal(await inverseKey("b/", tree), "b/");
    assert.equal(callCount, 1);

    assert.equal(await key("a", tree), "_a");
    assert.equal(await key("a", tree), "_a");
    assert.equal(callCount, 1);

    assert.equal(await key("b/", tree), "b/");
    assert.equal(await key("b", tree), "b");
    assert.equal(callCount, 1);
  });

  test("preserves trailing slashes if key function does so", async () => {
    const tree = new ObjectTree({
      a: "letter a",
    });
    const addUnderscore = async (sourceKey) => `_${sourceKey}`;
    const { inverseKey, key } = cachedKeyFunctions(addUnderscore);

    assert.equal(await key("a/", tree), "_a/");
    assert.equal(await key("a", tree), "_a");

    assert.equal(await inverseKey("_a/", tree), "a/");
    assert.equal(await inverseKey("_a", tree), "a");
  });

  test("if key function toggles slash, defers to key function slash handling", async () => {
    const tree = new ObjectTree({
      a: "letter a",
    });
    const addUnderscoreAndSlash = async (sourceKey) =>
      `_${trailingSlash.remove(sourceKey)}/`;
    const { inverseKey, key } = cachedKeyFunctions(addUnderscoreAndSlash);

    assert.equal(await inverseKey("_a/", tree), "a");
    assert.equal(await inverseKey("_a", tree), "a");

    assert.equal(await key("a", tree), "_a/");
    assert.equal(await key("a/", tree), "_a/");
  });
});
