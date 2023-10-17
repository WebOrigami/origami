import { ObjectTree } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import TextDocument from "../../src/common/TextDocument.js";
import unpackOrigamiTemplate from "../../src/loaders/orit.js";

describe(".orit loader", () => {
  test("loads a template", async () => {
    const text = `Hello, {{ _ }}!`;
    const fn = await unpackOrigamiTemplate(text);
    const value = await fn.call(null, "world");
    assert.deepEqual(value, "Hello, world!");
  });

  test("loads a template that reads from the calling scope", async () => {
    const scope = new ObjectTree({
      name: "Alice",
    });
    const text = `Hello, {{ name }}!`;
    const fn = await unpackOrigamiTemplate(text);
    const value = await fn.call(scope);
    assert.deepEqual(value, "Hello, Alice!");
  });

  test("template has access to its container via @container", async () => {
    const container = new ObjectTree({
      a: 1,
    });
    const fn = await unpackOrigamiTemplate("{{ @container/a }}", {
      parent: container,
    });
    const value = await fn();
    assert.deepEqual(value, "1");
  });

  test("template expressions have front matter in scope", async () => {
    const text = `---
name: Carol
---
Hello, {{ name }}!`;
    const fn = await unpackOrigamiTemplate(text);
    const document = await fn();
    assert.deepEqual(String(document), "Hello, Carol!");
  });

  test("template result includes input data", async () => {
    const text = "Hello, {{ _/name }}!";
    const parent = new ObjectTree({});
    const fn = await unpackOrigamiTemplate(text, { parent });
    const data = { name: "Alice" };
    const document = new TextDocument("Some text", data);
    const result = await fn(document);
    assert.deepEqual(String(result), "Hello, Alice!");
    const resultData = await result.unpack();
    assert.deepEqual(resultData, { name: "Alice" });
    assert.deepEqual(result.parent, parent);
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
    const value = await fn.call();
    assert.deepEqual(String(value), "Hello, Bob!");
  });

  test("front matter expressions have input in scope via `_`", async () => {
    const text = `---
name: !ori _/fullName
---
Hello, {{ name }}!`;
    const fn = await unpackOrigamiTemplate(text);
    const value = await fn({ fullName: "Alice Andrews" });
    assert.deepEqual(String(value), "Hello, Alice Andrews!");
  });

  test("template expressions can access their defining scope via @local", async () => {
    const parent = new ObjectTree({ name: "Bob" });
    const text = new TextDocument(`Hello, {{ @local/name }}!`, null, parent);
    const fn = await unpackOrigamiTemplate(text);
    const value = await fn();
    assert.deepEqual(value, "Hello, Bob!");
  });
});
