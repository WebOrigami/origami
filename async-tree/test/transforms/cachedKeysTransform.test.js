import assert from "node:assert";
import { describe, test } from "node:test";
import ObjectTree from "../../src/ObjectTree.js";
import * as Tree from "../../src/Tree.js";
import createCachedKeysTransform from "../../src/transforms/cachedKeysTransform.js";

describe("createCachedKeysTransform", () => {
  test("passes through with no keyFn", async () => {
    const tree = new ObjectTree({
      a: "letter a",
      b: "letter b",
    });
    const uppercaseValues = createCachedKeysTransform({
      valueFn: (innerValue, innerKey, tree) => innerValue.toUpperCase(),
    });
    const mapped = uppercaseValues(tree);
    assert.deepEqual(await Tree.plain(mapped), {
      a: "LETTER A",
      b: "LETTER B",
    });
  });

  test("maps keys with caching", async () => {
    const tree = new ObjectTree({
      a: "letter a",
      b: "letter b",
    });
    let callCount = 0;
    const uppercaseKeys = createCachedKeysTransform({
      keyFn: async (innerKey, tree) => {
        callCount++;
        return `_${innerKey}`;
      },
    });

    const mapped = uppercaseKeys(tree);

    const _a = await mapped.get("_a");
    assert.equal(_a, "letter a");
    assert.equal(callCount, 1);

    const _b = await mapped.get("_b");
    assert.equal(_b, "letter b");
    assert.equal(callCount, 2);

    const _c = await mapped.get("_c");
    assert.equal(_c, undefined);
    assert.equal(callCount, 2);

    assert.deepEqual(await Tree.plain(mapped), {
      _a: "letter a",
      _b: "letter b",
    });
    assert.equal(callCount, 2);
  });
});
