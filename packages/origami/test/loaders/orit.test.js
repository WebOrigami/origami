import { FilesGraph, ObjectGraph } from "@graphorigami/core";
import assert from "node:assert";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import loadOrigamiTemplate from "../../src/loaders/orit.js";

const dirname = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures"
);
const fixtures = new FilesGraph(dirname);

describe(".orit loader", () => {
  test("loads a template", async () => {
    const fileName = "greet.orit";
    const templateText = await fixtures.get(fileName);
    const templateFile = await loadOrigamiTemplate(templateText, fileName);
    assert.equal(String(templateFile), String(templateText));
    const fn = await templateFile.contents();
    const value = await fn.call(null, "world");
    assert.deepEqual(value, "Hello, world!");
  });

  test("loads a template that reads from scope", async () => {
    const scope = new ObjectGraph({
      name: "Alice",
    });
    const fileName = "greetName.orit";
    const templateText = await fixtures.get(fileName);
    const templateFile = await loadOrigamiTemplate(templateText, fileName);
    assert.equal(String(templateFile), String(templateText));
    const fn = await templateFile.contents();
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
    const innerTemplateFile = await loadOrigamiTemplate(
      innerTemplateText,
      innerFileName
    );
    const scope = new ObjectGraph({
      "greet.orit": innerTemplateFile,
    });

    const outerFileName = "includeGreet.orit";
    const outerTemplateText = await fixtures.get(outerFileName);
    const outerTemplateFile = await loadOrigamiTemplate(
      outerTemplateText,
      outerFileName
    );
    assert.equal(String(outerTemplateFile), String(outerTemplateText));
    const fn = await outerTemplateFile.contents();
    const value = await fn.call(scope, "Bob");
    assert.deepEqual(value, "<h1>Hello, Bob!</h1>");
  });

  test("template has access to its container via @container", async () => {
    const container = new ObjectGraph({
      a: 1,
    });
    const templateFile = await loadOrigamiTemplate.call(
      container,
      "{{ @container/a }}"
    );
    const fn = await templateFile.contents();
    const value = await fn();
    assert.deepEqual(value, "1");
  });

  test("template can reference template front matter via @template", async () => {
    const templateText = await fixtures.get("frontMatter.orit");
    const templateFile = await loadOrigamiTemplate(templateText);
    const fn = await templateFile.contents();
    const value = await fn();
    assert.deepEqual(value, "Hello, Carol!");
  });

  test("template can invoke a @map", async () => {
    const templateText = await fixtures.get("map.orit");
    const templateFile = await loadOrigamiTemplate(templateText);
    const fn = await templateFile.contents();
    const value = await fn();
    assert.deepEqual(value, "Hello, Alice! Hello, Bob! Hello, Carol! ");
  });
});
