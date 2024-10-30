import { ObjectTree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import inline from "../../src/builtins/@inline.js";
import fileTypeText from "../../src/builtins/txt.handler.js";

describe("inline", () => {
  test("inlines Origami expressions found in input text", async () => {
    const parent = new ObjectTree({
      name: "Alice",
    });
    const document = await fileTypeText.unpack("Hello, ${name}!", { parent });
    const inlined = await inline.call(null, document);
    assert(inlined, "Hello, Alice!");
  });

  test("can reference itself via `_` ambient", async () => {
    const document = await fileTypeText.unpack(`---
name: Bob
---
Hello, \${ _/name }!`);
    /** @type {any} */
    const inlined = await inline.call(null, document);
    assert.deepEqual(inlined, {
      "@text": `Hello, Bob!`,
      name: "Bob",
    });
  });
});
