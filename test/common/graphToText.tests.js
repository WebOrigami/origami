import { ExplorableObject } from "../../exports.js";
import graphToText from "../../src/common/graphToText.js";
import assert from "../assert.js";

describe.only("graphToText", () => {
  it("for a JSON key, renders a graph as JSON", async () => {
    const graph = new ExplorableObject({ a: "Hello, a." });
    const text = await graphToText(graph, "foo.json");
    assert.equal(text, `{\n  "a": "Hello, a."\n}`);
  });

  it("for a YAML key, renders a graph as YAML", async () => {
    const graph = new ExplorableObject({ a: "Hello, a." });
    const text = await graphToText(graph, "foo.yaml");
    assert.equal(text, `a: Hello, a.\n`);
  });

  it("if value is a function, invokes it", async () => {
    const f = () => new ExplorableObject({ a: "Hello, a." });
    const text = await graphToText(f, "foo.yaml");
    assert.equal(text, `a: Hello, a.\n`);
  });
});
