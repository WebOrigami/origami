import assert from "node:assert";
import { describe, test } from "node:test";
import ObjectTree from "../../src/ObjectTree.js";
import cachedKeyFns from "../../src/transforms/cachedKeyFns.js";

describe("cachedKeyFns", () => {
  test("maps keys with caching", async () => {
    const tree = new ObjectTree({
      a: "letter a",
      b: "letter b",
    });

    let callCount = 0;
    const underscoreKeys = async (innerKey, tree) => {
      callCount++;
      return `_${innerKey}`;
    };

    const { innerKeyFn, keyFn } = cachedKeyFns(underscoreKeys);

    assert.equal(await innerKeyFn("_a", tree), "a"); // Cache miss
    assert.equal(callCount, 1);
    assert.equal(await innerKeyFn("_a", tree), "a");
    assert.equal(callCount, 1);
    assert.equal(await innerKeyFn("_b", tree), "b"); // Cache miss
    assert.equal(callCount, 2);

    assert.equal(await keyFn("a", tree), "_a");
    assert.equal(await keyFn("a", tree), "_a");
    assert.equal(await keyFn("b", tree), "_b");
    assert.equal(callCount, 2);

    // `c` isn't in tree, so we should get undefined.
    assert.equal(await innerKeyFn("_c", tree), undefined);
    // But key mapping is still possible.
    assert.equal(await keyFn("c", tree), "_c");
    // And now we have a cache hit.
    assert.equal(await innerKeyFn("_c", tree), "c");
    assert.equal(callCount, 3);
  });
});
