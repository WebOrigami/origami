import assert from "node:assert";
import { describe, test } from "node:test";
import ObjectTree from "../../src/ObjectTree.js";
import * as Tree from "../../src/Tree.js";
import createCachedKeysTransform from "../../src/transforms/cachedKeysTransform.js";

describe("createCachedKeysTransform", () => {
  test("maps values", async () => {
    const tree = new ObjectTree({
      a: "letter a",
      b: "letter b",
    });
    const uppercaseValues = createCachedKeysTransform({
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
    let callCount = 0;
    const uppercaseKeys = createCachedKeysTransform({
      keyFn: async (key) => {
        callCount++;
        return key.toUpperCase();
      },
    });
    const mapped = uppercaseKeys(tree);
    assert.deepEqual(await Tree.plain(mapped), {
      A: "letter a",
      B: "letter b",
    });
    assert.equal(callCount, 2);
  });
});
