import { ObjectGraph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import unpackOrigamiTemplate from "../../src/loaders/orit.js";

describe(".orit loader", () => {
  test("loads a template", async () => {
    const text = `Hello, {{ _ }}!`;
    const fn = await unpackOrigamiTemplate(text);
    const value = await fn.call(null, "world");
    assert.deepEqual(value, "Hello, world!");
  });

  test("loads a template that reads from its container's scope", async () => {
    const parent = new ObjectGraph({
      name: "Alice",
    });
    const text = `Hello, {{ name }}!`;
    const fn = await unpackOrigamiTemplate(text, { parent });
    const value = await fn();
    assert.deepEqual(value, "Hello, Alice!");
  });

  test("template has access to its container via @container", async () => {
    const container = new ObjectGraph({
      a: 1,
    });
    const fn = await unpackOrigamiTemplate("{{ @container/a }}", {
      parent: container,
    });
    const value = await fn();
    assert.deepEqual(value, "1");
  });

  test("template can reference template front matter via @attached", async () => {
    const text = `---
name: Carol
---
Hello, {{ @attached/name }}!`;
    const fn = await unpackOrigamiTemplate(text);
    const value = await fn();
    assert.deepEqual(value, "Hello, Carol!");
  });
});
