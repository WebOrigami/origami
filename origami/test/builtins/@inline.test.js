import { ObjectTree } from "@graphorigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import inline from "../../src/builtins/@inline.js";
import { from } from "../../src/common/textDocument2.js";

describe("inline", () => {
  test("inlines Origami expressions found in input text", async () => {
    const document = from(`Hello, {{ name }}!`);
    document.parent = new ObjectTree({
      name: "Alice",
    });
    const inlined = await inline.call(null, document);
    assert.equal(String(inlined), "Hello, Alice!");
    assert.equal(await inlined.get("@body"), "Hello, Alice!");
  });

  test("can reference keys in an attached tree", async () => {
    const document = from(`---
name: Bob
---
Hello, {{ name }}!`);
    /** @type {any} */
    const inlined = await inline.call(null, document);
    assert.equal(String(inlined), `Hello, Bob!`);
    assert.equal(await inlined.get("name"), "Bob");
  });

  test("can reference itself via `_` ambient", async () => {
    const document = from(`---
name: Bob
---
Hello, {{ _/name }}!`);
    /** @type {any} */
    const inlined = await inline.call(null, document);
    assert.equal(String(inlined), `Hello, Bob!`);
    assert.equal(await inlined.get("name"), "Bob");
  });
});
