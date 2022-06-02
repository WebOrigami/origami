import path from "path";
import { fileURLToPath } from "url";
import map from "../../src/builtins/map.js";
import ObjectGraph from "../../src/core/ObjectGraph.js";
import InheritScopeTransform from "../../src/framework/InheritScopeTransform.js";
import OrigamiTemplate from "../../src/framework/OrigamiTemplate.js";
import FilesGraph from "../../src/node/FilesGraph.js";
import assert from "../assert.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesDirectory = path.join(dirname, "fixtures/templates");
const templateFiles = new FilesGraph(templatesDirectory);

describe("OrigamiTemplate", () => {
  it("can make substitutions from input and context", async () => {
    const template = new OrigamiTemplate("{{greeting}}, {{name}}.");
    const input = { name: "world" };
    const scope = new ObjectGraph({ greeting: "Hello" });
    const result = await template.apply(input, scope);
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
    const graph = new (InheritScopeTransform(ObjectGraph))({
      greeting: "Hello",
      map,
      // people: [{ name: "Alice" }, { name: "Bob" }, { name: "Carol" }],
      people: {
        0: { name: "Alice" },
        1: { name: "Bob" },
        2: { name: "Carol" },
      },
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
});
