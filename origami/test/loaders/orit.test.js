import { ObjectTree } from "@graphorigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import unpackOrigamiTemplate from "../../src/builtins/@loaders/orit.js";
import * as textDocument2 from "../../src/common/textDocument2.js";

describe.only(".orit loader", () => {
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
    const inputDocument = textDocument2.bodyWithData("Some text", data);
    const outputDocument = await fn(inputDocument);
    assert.equal(String(outputDocument), "Hello, Alice!");
    assert.equal(await outputDocument.get("name"), "Alice");
    assert.equal(outputDocument.parent, parent);
  });

  test("front matter expressions can reference template's scope", async () => {
    const scope = new ObjectTree({
      greet: function (name) {
        return `Hello, ${name}!`;
      },
    });
    const text = `---
message: !ori greet("Bob")
---
{{ message }}`;
    const fn = await unpackOrigamiTemplate(text, { parent: scope });
    const document = await fn.call();
    assert.equal(String(document), "Hello, Bob!");
  });

  test.only("front matter expressions have input in scope via `_`", async () => {
    const text = `---
name: !ori _/fullName
---
Hello, {{ name }}!`;
    const fn = await unpackOrigamiTemplate(text);
    const document = await fn({ fullName: "Alice Andrews" });
    assert.equal(String(document), "Hello, Alice Andrews!");
  });
});
