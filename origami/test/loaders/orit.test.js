import { ObjectTree } from "@graphorigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import unpackOrigamiTemplate from "../../src/builtins/@loaders/orit.js";
import TextDocument from "../../src/common/TextDocument.js";

describe(".orit loader", () => {
  test("loads a template", async () => {
    const text = `Hello, {{ _ }}!`;
    const fn = await unpackOrigamiTemplate(text);
    const document = await fn.call(null, "world");
    assert.equal(String(document), "Hello, world!");
  });

  test("template has access to its parent via scope", async () => {
    const parent = new ObjectTree({
      a: 1,
    });
    const fn = await unpackOrigamiTemplate("{{ a }}", {
      parent,
    });
    const document = await fn();
    assert.equal(String(document), "1");
  });

  test("template expressions have front matter in scope", async () => {
    const text = `---
name: Carol
---
Hello, {{ name }}!`;
    const fn = await unpackOrigamiTemplate(text);
    const document = await fn();
    assert.equal(String(document), "Hello, Carol!");
  });

  test("template result includes input data", async () => {
    const text = "Hello, {{ _/name }}!";
    const parent = new ObjectTree({});
    const fn = await unpackOrigamiTemplate(text, { parent });
    const data = { name: "Alice" };
    const inputDocument = new TextDocument("Some text", data);
    const outputDocument = await fn(inputDocument);
    assert.deepEqual(outputDocument, {
      "@text": "Hello, Alice!",
      name: "Alice",
    });
    assert.equal(String(outputDocument), "Hello, Alice!");
  });

  test("front matter expressions can reference template's scope", async () => {
    const parent = new ObjectTree({
      greet: function (name) {
        return `Hello, ${name}!`;
      },
    });
    const text = `---
message: !ori greet("Bob")
---
{{ message }}`;
    const fn = await unpackOrigamiTemplate(text, { parent });
    const document = await fn.call();
    assert.equal(String(document), "Hello, Bob!");
  });
});
