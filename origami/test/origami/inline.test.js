import { ObjectTree } from "@weborigami/async-tree";
import txtHandler from "@weborigami/language/src/handlers/txt.handler.js";
import assert from "node:assert";
import { describe, test } from "node:test";
import inline from "../../src/origami/inline.js";

describe("inline", () => {
  test("inlines Origami expressions found in input text", async () => {
    const parent = new ObjectTree({
      name: "Alice",
    });
    const document = await txtHandler.unpack("Hello, ${name}!", { parent });
    const inlined = await inline(document);
    assert(inlined, "Hello, Alice!");
  });

  test("can reference its own front matter", async () => {
    const text = `---
name: Bob
---
Hello, \${ name }!`;
    /** @type {any} */
    const inlined = await inline(text);
    assert.deepEqual(inlined, {
      name: "Bob",
      _body: `Hello, Bob!`,
    });
  });

  test("document reference its own properties", async () => {
    const document = {
      name: "Carol",
      _body: `Hello, \${ name }!`,
    };
    /** @type {any} */
    const inlined = await inline(document);
    assert.deepEqual(inlined, {
      name: "Carol",
      _body: `Hello, Carol!`,
    });
  });
});
