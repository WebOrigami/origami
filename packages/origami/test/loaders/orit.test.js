import { FilesGraph, ObjectGraph } from "@graphorigami/core";
import assert from "node:assert";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import FrontMatterDocument from "../../src/common/FrontMatterDocument.js";
import loadOrigamiTemplate from "../../src/loaders/orit.js";

const dirname = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures"
);
const fixtures = new FilesGraph(dirname);

describe.only(".orit loader", () => {
  test("loads a template", async () => {
    const fileName = "greet.orit";
    const text = await fixtures.get(fileName);
    const template = await loadOrigamiTemplate(null, text, fileName);
    assert.equal(String(template), String(text));
    const fn = await template.contents();
    const value = await fn.call(null, "world");
    assert.deepEqual(value, "Hello, world!");
  });

  test("loads a template that reads from scope", async () => {
    const scope = new ObjectGraph({
      name: "Alice",
    });
    const fileName = "greetName.orit";
    const text = await fixtures.get(fileName);
    const template = await loadOrigamiTemplate(null, text, fileName);
    assert.equal(String(template), String(text));
    const fn = await template.contents();
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
    const innertemplate = await loadOrigamiTemplate(
      fixtures,
      innerTemplateText,
      innerFileName
    );
    const scope = new ObjectGraph({
      "greet.orit": innertemplate,
    });

    const outerFileName = "includeGreet.orit";
    const outerTemplateText = await fixtures.get(outerFileName);
    const outertemplate = await loadOrigamiTemplate(
      fixtures,
      outerTemplateText,
      outerFileName
    );
    assert.equal(String(outertemplate), String(outerTemplateText));
    const fn = await outertemplate.contents();
    const value = await fn.call(scope, "Bob");
    assert.deepEqual(value, "<h1>Hello, Bob!</h1>");
  });

  test("template has access to its container via @container", async () => {
    const container = new ObjectGraph({
      a: 1,
    });
    const template = await loadOrigamiTemplate(container, "{{ @container/a }}");
    const fn = await template.contents();
    const value = await fn();
    assert.deepEqual(value, "1");
  });

  test("template can reference template front matter via @attached", async () => {
    const text = await fixtures.get("frontMatter.orit");
    const template = await loadOrigamiTemplate(null, text);
    const fn = await template.contents();
    const value = await fn();
    assert.deepEqual(value, "Hello, Carol!");
  });

  test("template can invoke a @map", async () => {
    const text = await fixtures.get("map.orit");
    const template = await loadOrigamiTemplate(null, text);
    const fn = await template.contents();
    const value = await fn();
    assert.deepEqual(value, "Hello, Alice! Hello, Bob! Hello, Carol! ");
  });

  test.only("can load a template from text of another document", async () => {
    const text = `---
name: Bob
---
Hello, {{ @attached/name }}!`;
    const document = new FrontMatterDocument(text);
    const template = await loadOrigamiTemplate(null, document);
    assert.equal(String(template), text);
    assert.equal(template.bodyText, "Hello, {{ @attached/name }}!");
    const fn = await template.contents();
    const value = await fn();
    assert.deepEqual(value, "Hello, Bob!");
  });
});
