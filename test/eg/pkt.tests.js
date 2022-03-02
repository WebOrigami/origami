import path from "path";
import { fileURLToPath } from "url";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import pkt from "../../src/eg/builtins/pkt.js";
import shallowMap from "../../src/eg/builtins/shallowMap.js";
import ExplorableFiles from "../../src/node/ExplorableFiles.js";
import ImplicitModulesTransform from "../../src/node/ImplicitModulesTransform.js";
import assert from "../assert.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = path.join(dirname, "fixtures");
const fixturesGraph = new (ImplicitModulesTransform(ExplorableFiles))(
  fixturesDirectory
);

describe("pkt (pika template)", () => {
  it("substitutes values from the supplied graph", async () => {
    const template = await fixturesGraph.get("template.pkt");
    const result = await pkt.call(fixturesGraph, template);
    const normalized = result.toString().replace(/\r\n/g, "\n");
    assert.equal(
      normalized,
      `This is a template containing substitutions.

Hello, world.

Hello, Alice.
`
    );
  });

  it("can map data to a nested template", async () => {
    const template =
      "Greetings:\n{{shallowMap(people, template`{{greeting}}, {{name}}.\n`)}}";
    const graph = ExplorableGraph.from({
      greeting: "Hello",
      people: [{ name: "Alice" }, { name: "Bob" }, { name: "Carol" }],
      shallowMap,
    });
    const result = await pkt.call(graph, template);
    assert.equal(
      result,
      `Greetings:
Hello, Alice.
Hello, Bob.
Hello, Carol.
`
    );
  });

  it("template has access to @key and @value", async () => {
    const template =
      "{{ shallowMap(array, template`{{ @key }}: {{ @value }}\n`) }}";
    const graph = ExplorableGraph.from({
      array: ["a", "b", "c"],
      shallowMap,
    });
    const result = await pkt.call(graph, template);
    assert.equal(
      result,
      `0: a
1: b
2: c
`
    );
  });
});
