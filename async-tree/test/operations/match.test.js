/** @typedef {import("@weborigami/types").AsyncTree} AsyncTree */
import { Tree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import match from "../../src/operations/match.js";

describe("match", () => {
  test("matches keys against a simplified pattern", async () => {
    /** @this {AsyncTree|null} */
    function fn(matches) {
      return `Hello, ${matches.name}!`;
    }
    const tree = match("[name].html", fn, [
      "Alice.html",
      "Bob.html",
      "Carol.html",
    ]);
    assert.deepEqual(await Tree.plain(tree), {
      "Alice.html": "Hello, Alice!",
      "Bob.html": "Hello, Bob!",
      "Carol.html": "Hello, Carol!",
    });
    const value = await tree.get("David.html");
    assert.equal(value, "Hello, David!");
  });

  test("matches keys against a regular expression", async () => {
    /** @this {AsyncTree|null} */
    function fn(matches) {
      return `Hello, ${matches.name}!`;
    }
    const tree = match(/^(?<name>.+)\.html$/, fn);
    const value = await tree.get("Alice.html");
    assert.equal(value, "Hello, Alice!");
  });
});
