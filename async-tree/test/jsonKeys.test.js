import assert from "node:assert";
import { describe, test } from "node:test";
import { DeepObjectTree } from "../src/internal.js";
import * as jsonKeys from "../src/jsonKeys.js";

describe("jsonKeys", () => {
  test("stringifies JSON Keys", async () => {
    const tree = new DeepObjectTree({
      about: {},
      "index.html": "Home",
    });
    const json = await jsonKeys.stringify(tree);
    assert.strictEqual(json, '["about/","index.html"]');
  });
});
