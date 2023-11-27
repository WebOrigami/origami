import { ObjectTree } from "@graphorigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import inline from "../../src/builtins/@inline.js";
import unpackText from "../../src/builtins/@loaders/txt.js";

describe("inline", () => {
  test("inlines Origami expressions found in input text", async () => {
    const parent = new ObjectTree({
      name: "Alice",
    });
    const document = await unpackText(`Hello, {{ name }}!`, { parent });
    const inlined = await inline.call(null, document);
    assert.equal(String(inlined), "Hello, Alice!");
  });

  test("can reference values in front matter", async () => {
    const document = await unpackText(`---
name: Bob
---
Hello, {{ name }}!`);
    /** @type {any} */
    const inlined = await inline.call(null, document);
    assert.equal(String(inlined), `Hello, Bob!`);
    assert.deepEqual(inlined, {
      "@text": `Hello, Bob!`,
      name: "Bob",
    });
  });

  test("can reference itself via `_` ambient", async () => {
    const document = await unpackText(`---
name: Bob
---
Hello, {{ _/name }}!`);
    /** @type {any} */
    const inlined = await inline.call(null, document);
    assert.equal(String(inlined), `Hello, Bob!`);
  });
});
