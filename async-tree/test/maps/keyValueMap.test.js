import assert from "node:assert";
import { describe, test } from "node:test";
import ObjectTree from "../../src/ObjectTree.js";
import * as Tree from "../../src/Tree.js";
import keyValueMap from "../../src/maps/keyValueMap.js";

describe("keyValueMap", () => {
  test("maps values", async () => {
    const tree = new ObjectTree({
      a: "letter a",
      b: "letter b",
      more: {
        c: "letter c",
      },
    });
    const uppercaseValues = keyValueMap({
      valueFn: (value) => value.toUpperCase(),
    });
    const mapped = uppercaseValues(tree);
    assert.deepEqual(await Tree.plain(mapped), {
      a: "LETTER A",
      b: "LETTER B",
      more: {
        c: "LETTER C",
      },
    });
  });

  test("maps keys and values", async () => {
    const tree = new ObjectTree({
      a: "letter a",
      b: "letter b",
      more: {
        c: "letter c",
      },
    });
    const uppercaseKeysValues = keyValueMap({
      keyFn: (key) => key.toUpperCase(),
      valueFn: (value) => value.toUpperCase(),
    });
    const mapped = uppercaseKeysValues(tree);
    assert.deepEqual(await Tree.plain(mapped), {
      A: "LETTER A",
      B: "LETTER B",
      MORE: {
        C: "LETTER C",
      },
    });
  });
});
