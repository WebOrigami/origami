import assert from "node:assert";
import { describe, test } from "node:test";
import ObjectTree from "../../src/ObjectTree.js";
import cachedKeyFunctions from "../../src/transforms/cachedKeyFunctions.js";

describe("cachedKeyFunctions", () => {
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

    const { inverseKey, key } = cachedKeyFunctions(underscoreKeys);

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
});
