import { DeepObjectTree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import * as jsonKeys from "../src/jsonKeys.js";

describe("jsonKeys", () => {
  test("parses JSON Keys", async () => {
    const json = '["index.html","about/"]';
    const parsed = jsonKeys.parse(json);
    assert.deepStrictEqual(parsed, {
      "index.html": false,
      about: true,
    });
  });

  test("stringifies JSON Keys", async () => {
    const tree = new DeepObjectTree({
      about: {},
      "index.html": "Home",
    });
    const json = await jsonKeys.stringify(tree);
    assert.strictEqual(json, '["about/","index.html"]');
  });
});
