import path from "path";
import { fileURLToPath } from "url";
import map from "../../src/builtins/map.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ExplorableObject from "../../src/core/ExplorableObject.js";
import OrigamiTemplate from "../../src/framework/OrigamiTemplate.js";
import ExplorableFiles from "../../src/node/ExplorableFiles.js";
import assert from "../assert.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesDirectory = path.join(dirname, "fixtures/templates");
const templateFiles = new ExplorableFiles(templatesDirectory);

describe("OrigamiTemplate", () => {
  it("can make substitutions from input and context", async () => {
    const template = new OrigamiTemplate("{{greeting}}, {{name}}.");
    const input = { name: "world" };
    const context = new ExplorableObject({ greeting: "Hello" });
    const result = await template.apply(input, context);
    assert.equal(result, "Hello, world.");
  });

  it("can inline files", async () => {
    const template = new OrigamiTemplate(
      `This template inlines a file.
{{ plain.txt }}`
    );
    const result = await template.apply(null, templateFiles);
    const normalized = result?.toString().replace(/\r\n/g, "\n");
    assert.equal(
      normalized,
      `This template inlines a file.
Hello, world.
`
    );
  });

  it("can map data to a nested template", async () => {
    const template = new OrigamiTemplate(
      "Greetings:\n{{map(people, =`{{greeting}}, {{name}}.\n`)}}"
    );
    const graph = ExplorableGraph.from({
      greeting: "Hello",
      map,
      people: [{ name: "Alice" }, { name: "Bob" }, { name: "Carol" }],
    });
    const result = await template.apply(null, graph);
    assert.equal(
      result,
      `Greetings:
Hello, Alice.
Hello, Bob.
Hello, Carol.
`
    );
  });

  it("defines ambient property @input that references input data", async () => {
    const template = new OrigamiTemplate("Hello, {{ @input }}.");
    const graph = new ExplorableObject({});
    const result = await template.apply("world", graph);
    assert.equal(result, "Hello, world.");
  });

  it("gives template access to @key and @value", async () => {
    const template = new OrigamiTemplate(
      "{{ map(array, =`{{ @key }}: {{ @value }}\n`) }}"
    );
    const graph = ExplorableGraph.from({
      array: ["a", "b", "c"],
      map,
    });
    const result = await template.apply(null, graph);
    assert.equal(
      result,
      `0: a
1: b
2: c
`
    );
  });
});
