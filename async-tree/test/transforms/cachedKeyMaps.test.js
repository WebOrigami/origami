import assert from "node:assert";
import { describe, test } from "node:test";
import ObjectTree from "../../src/ObjectTree.js";
import cachedKeyMaps from "../../src/transforms/cachedKeyMaps.js";

describe("cachedKeyMaps", () => {
  test("maps keys with caching", async () => {
    const tree = new ObjectTree({
      a: "letter a",
      b: "letter b",
    });

    let callCount = 0;
    const underscoreKeys = async (sourceKey, tree) => {
      callCount++;
      return `_${sourceKey}`;
    };

    const { inverseKeyMap, keyMap } = cachedKeyMaps(underscoreKeys);

    assert.equal(await inverseKeyMap("_a", tree), "a"); // Cache miss
    assert.equal(callCount, 1);
    assert.equal(await inverseKeyMap("_a", tree), "a");
    assert.equal(callCount, 1);
    assert.equal(await inverseKeyMap("_b", tree), "b"); // Cache miss
    assert.equal(callCount, 2);

    assert.equal(await keyMap("a", tree), "_a");
    assert.equal(await keyMap("a", tree), "_a");
    assert.equal(await keyMap("b", tree), "_b");
    assert.equal(callCount, 2);

    // `c` isn't in tree, so we should get undefined.
    assert.equal(await inverseKeyMap("_c", tree), undefined);
    // But key mapping is still possible.
    assert.equal(await keyMap("c", tree), "_c");
    // And now we have a cache hit.
    assert.equal(await inverseKeyMap("_c", tree), "c");
    assert.equal(callCount, 3);
  });
});
