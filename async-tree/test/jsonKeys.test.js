import assert from "node:assert";
import { describe, test } from "node:test";
import DeepObjectMap from "../src/drivers/DeepObjectMap.js";
import * as jsonKeys from "../src/jsonKeys.js";

describe("jsonKeys", () => {
  test("creates JSON keys for a simple map", async () => {
    const tree = new /** @type {any} */ (Map)([
      ["index.html", "Home"],
      ["about", new Map()],
    ]);
    const json = await jsonKeys.stringify(tree);
    assert.strictEqual(json, '["index.html","about/"]');
  });

  test("creates JSON keys for a map that supports trailing slashes", async () => {
    const tree = new DeepObjectMap({
      about: {},
      "index.html": "Home",
    });
    const json = await jsonKeys.stringify(tree);
    assert.strictEqual(json, '["about/","index.html"]');
  });
});
