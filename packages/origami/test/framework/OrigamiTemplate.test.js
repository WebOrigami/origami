import { FilesGraph, ObjectGraph } from "@graphorigami/core";
import assert from "node:assert";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import mapValues from "../../src/builtins/@map/values.js";
import InheritScopeTransform from "../../src/framework/InheritScopeTransform.js";
import loadOrigamiTemplate from "../../src/loaders/ori.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesDirectory = path.join(dirname, "fixtures/templates");
const templateFiles = new FilesGraph(templatesDirectory);

describe("OrigamiTemplate", () => {
  test("can make substitutions from input and context", async () => {
    const template = loadOrigamiTemplate("{{greeting}}, {{name}}.");
    const input = { name: "world" };
    const scope = new ObjectGraph({ greeting: "Hello" });
    const result = await template.call(scope, input);
    assert.equal(result, "Hello, world.");
  });

  test("can inline files", async () => {
    const template = loadOrigamiTemplate(
      `This template inlines a file.
{{ plain.txt }}`
    );
    const result = await template.call(templateFiles);
    const normalized = result?.toString().replace(/\r\n/g, "\n");
    assert.equal(
      normalized,
      `This template inlines a file.
Hello, world.
`
    );
  });

  test("can map data to a nested template", async () => {
    const template = loadOrigamiTemplate(
      "Greetings:\n{{map(people, =`{{greeting}}, {{./name}}.\n`)}}"
    );
    const graph = new (InheritScopeTransform(ObjectGraph))({
      greeting: "Hello",
      map: mapValues,
      people: {
        0: { name: "Alice" },
        1: { name: "Bob" },
        2: { name: "Carol" },
      },
    });
    const result = await template.call(graph);
    assert.equal(
      result,
      `Greetings:
Hello, Alice.
Hello, Bob.
Hello, Carol.
`
    );
  });

  test.skip("can recurse via @template/apply", async () => {
    const template = loadOrigamiTemplate(
      `{{ @if @graph/isAsyncDictionary(@input)
        =\`({{ @map/values(@input, @template/recurse) }})\`
        =\`{{ @input }} \`
      }}`
    );
    const obj = {
      a: 1,
      b: 2,
      more: {
        c: 3,
        d: 4,
      },
    };
    const result = await template.call(null, obj);
    assert.equal(String(result), "(1 2 (3 4 ))");
  });
});
