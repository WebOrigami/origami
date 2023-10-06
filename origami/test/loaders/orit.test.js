import { FilesGraph, ObjectGraph } from "@graphorigami/core";
import assert from "node:assert";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import TextDocument from "../../src/common/TextDocument.js";
import unpackOrigamiTemplate from "../../src/loaders/orit.js";

const dirname = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures"
);
const fixtures = new FilesGraph(dirname);

describe(".orit loader", () => {
  test("loads a template", async () => {
    const fileName = "greet.orit";
    const text = await fixtures.get(fileName);
    const fn = await unpackOrigamiTemplate(text);
    const value = await fn.call(null, "world");
    assert.deepEqual(value, "Hello, world!");
  });

  test("loads a template that reads from its container's scope", async () => {
    const parent = new ObjectGraph({
      name: "Alice",
    });
    const fileName = "greetName.orit";
    const text = await fixtures.get(fileName);
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
    const text = await fixtures.get("frontMatter.orit");
    const fn = await unpackOrigamiTemplate(text);
    const value = await fn();
    assert.deepEqual(value, "Hello, Carol!");
  });

  test("can load a template from text of another document", async () => {
    const text = `---
name: Bob
---
Hello, {{ @attached/name }}!`;
    const document = TextDocument.from(text);
    const fn = await unpackOrigamiTemplate(document);
    const value = await fn();
    assert.deepEqual(value, "Hello, Bob!");
  });
});
