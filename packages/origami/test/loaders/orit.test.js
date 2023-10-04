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
    const fn = await unpackOrigamiTemplate(null, text, fileName);
    const value = await fn.call(null, "world");
    assert.deepEqual(value, "Hello, world!");
  });

  test("loads a template that reads from scope", async () => {
    const scope = new ObjectGraph({
      name: "Alice",
    });
    const fileName = "greetName.orit";
    const text = await fixtures.get(fileName);
    const fn = await unpackOrigamiTemplate(null, text, fileName);
    const value = await fn.call(scope);
    assert.deepEqual(value, "Hello, Alice!");
  });

  test("loads a template that can include another template", async () => {
    // Normally a .orit file would be loaded via FileLoadersTransform, but for
    // testing purposes we will use FilesGraph directly. We do the loading of
    // the inner template by hand, then construct a scope for the outer template
    // that includes the inner template.
    const innerFileName = "greet.orit";
    const innerTemplateText = await fixtures.get(innerFileName);
    const innertemplateFn = await unpackOrigamiTemplate(
      fixtures,
      innerTemplateText,
      innerFileName
    );
    const scope = new ObjectGraph({
      "greet.orit": innertemplateFn,
    });

    const outerFileName = "includeGreet.orit";
    const outerTemplateText = await fixtures.get(outerFileName);
    const outertemplateFn = await unpackOrigamiTemplate(
      fixtures,
      outerTemplateText,
      outerFileName
    );
    const value = await outertemplateFn.call(scope, "Bob");
    assert.deepEqual(value, "<h1>Hello, Bob!</h1>");
  });

  test("template has access to its container via @container", async () => {
    const container = new ObjectGraph({
      a: 1,
    });
    const fn = await unpackOrigamiTemplate(container, "{{ @container/a }}");
    const value = await fn();
    assert.deepEqual(value, "1");
  });

  test("template can reference template front matter via @attached", async () => {
    const text = await fixtures.get("frontMatter.orit");
    const fn = await unpackOrigamiTemplate(null, text);
    const value = await fn();
    assert.deepEqual(value, "Hello, Carol!");
  });

  test("template can invoke a @map", async () => {
    const text = await fixtures.get("map.orit");
    const fn = await unpackOrigamiTemplate(null, text);
    const value = await fn();
    assert.deepEqual(value, "Hello, Alice! Hello, Bob! Hello, Carol! ");
  });

  test("can load a template from text of another document", async () => {
    const text = `---
name: Bob
---
Hello, {{ @attached/name }}!`;
    const document = TextDocument.from(text);
    const fn = await unpackOrigamiTemplate(null, document);
    const value = await fn();
    assert.deepEqual(value, "Hello, Bob!");
  });
});
