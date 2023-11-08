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
      keyFn: async (innerValue, innerKey, tree) => {
        callCount++;
        return `${innerKey}${innerKey}`;
      },
    });

    const mapped = uppercaseKeys(tree);

    const aa = await mapped.get("aa");
    assert.equal(aa, "letter a");
    assert.equal(callCount, 1);

    const bb = await mapped.get("bb");
    assert.equal(bb, "letter b");
    assert.equal(callCount, 2);

    const cc = await mapped.get("cc");
    assert.equal(cc, undefined);
    assert.equal(callCount, 2);

    assert.deepEqual(await Tree.plain(mapped), {
      aa: "letter a",
      bb: "letter b",
    });
    assert.equal(callCount, 2);
  });
});
