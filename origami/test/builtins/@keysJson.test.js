import { DeepObjectTree, Tree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import keysJson from "../../src/builtins/@keysJson.js";

describe("keysJson", () => {
  test("adds .keys.json entries to tree", async () => {
    const tree = new DeepObjectTree({
      about: {
        "Alice.html": "Hello, Alice!",
        "Bob.html": "Hello, Bob!",
        "Carol.html": "Hello, Carol!",
      },
    });
    const result = await keysJson.call(null, tree);
    assert.deepEqual(await Tree.plain(result), {
      ".keys.json": `["about/"]`,
      about: {
        ".keys.json": `["Alice.html","Bob.html","Carol.html"]`,
        "Alice.html": "Hello, Alice!",
        "Bob.html": "Hello, Bob!",
        "Carol.html": "Hello, Carol!",
      },
    });
  });
});
