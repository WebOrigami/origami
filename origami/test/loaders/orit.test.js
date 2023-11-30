import { ObjectTree } from "@graphorigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import unpackOrigamiTemplate from "../../src/builtins/@loaders/orit.js";
import unpackText from "../../src/builtins/@loaders/txt.js";
import TextDocument from "../../src/common/TextDocument.js";

describe(".orit loader", () => {
  test("loads a template", async () => {
    const text = `Hello, {{ _ }}!`;
    const fn = await unpackOrigamiTemplate(text);
    const result = await fn.call(null, "world");
    assert.equal(String(result), "Hello, world!");
  });

  test("template has access to its parent via scope", async () => {
    const parent = new ObjectTree({
      a: 1,
    });
    const fn = await unpackOrigamiTemplate("{{ a }}", {
      parent,
    });
    const result = await fn();
    assert.equal(String(result), "1");
  });

  test("templates defined from loaded text documents have front matter in scope", async () => {
    const text = `---
name: Carol
---
Hello, {{ name }}!`;
    const inputDocument = await unpackText(text);
    const fn = await unpackOrigamiTemplate(inputDocument);
    const result = await fn();
    assert.equal(String(result), "Hello, Carol!");
  });

  test("template result unpacks to input data", async () => {
    const text = "Hello, {{ _/name }}!";
    const parent = new ObjectTree({});
    const fn = await unpackOrigamiTemplate(text, { parent });
    const inputDocument = new TextDocument({
      name: "Alice",
      "@text": "Some text",
    });
    const result = await fn(inputDocument);
    assert.deepEqual(String(result), "Hello, Alice!");
    assert.deepEqual(await result.unpack(), inputDocument);
  });

  test("expressions can reference template's scope", async () => {
    const parent = new ObjectTree({
      greet: function (name) {
        return `Hello, ${name}!`;
      },
    });
    const templateDocument = await unpackText(
      `---
message: !ori greet("Bob")
---
{{ message }}`,
      { parent }
    );
    const fn = await unpackOrigamiTemplate(templateDocument);
    const result = await fn.call();
    assert.equal(String(result), "Hello, Bob!");
  });
});
