import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ObjectGraph from "../../src/core/ObjectGraph.js";
import * as utilities from "../../src/core/utilities.js";
import assert from "../assert.js";

describe("utilities", () => {
  it("extractFrontMatter() returns front matter if found", () => {
    const text = utilities.extractFrontMatter(`---
a: Hello, a.
---
This is the content.
`);
    assert.deepEqual(text, {
      frontBlock: "---\na: Hello, a.\n---\n",
      bodyText: "This is the content.\n",
      frontData: {
        a: "Hello, a.",
      },
    });
  });

  it("extractFrontMatter returns null if no front matter is found", () => {
    const text = "a: Hello, a.";
    assert.equal(utilities.extractFrontMatter(text), null);
  });

  it("parse can combine front matter and body text", () => {
    const parsed = utilities.parseYaml(`---
a: Hello, a.
---
This is the content.
`);
    assert.deepEqual(parsed, {
      a: "Hello, a.",
      "@text": "This is the content.\n",
    });
  });

  it("outputFrontMatter writes output as text if there's no graph", async () => {
    const text = "This is the content.";
    const output = await utilities.outputWithGraph(text);
    assert.equal(output, text);
  });

  it("outputFrontMatter adds graph to output", async () => {
    const text = "This is the content.";
    const graph = new ObjectGraph({ a: "Hello, a." });
    const output = await utilities.outputWithGraph(text, graph);
    assert.equal(String(output), text);
    const outputGraph = output.toGraph();
    assert.deepEqual(await ExplorableGraph.plain(outputGraph), {
      a: "Hello, a.",
    });
  });

  it("outputFrontMatter can include front matter", async () => {
    const text = "This is the content.";
    const graph = new ObjectGraph({ a: "Hello, a." });
    const output = await utilities.outputWithGraph(text, graph, true);
    assert.equal(
      output,
      `---
a: Hello, a.
---
This is the content.`
    );
    const outputGraph = output.toGraph();
    assert.deepEqual(await ExplorableGraph.plain(outputGraph), {
      a: "Hello, a.",
    });
  });

  it("sortNatural can sort values by natural sort order", () => {
    const keys = ["b", 10, 2, "c", 1, "a"];
    const sorted = utilities.sortNatural(keys);
    assert.deepEqual(sorted, [1, 2, 10, "a", "b", "c"]);
  });

  it("transformObject can apply a class mixin to a single object instance", () => {
    function FixtureTransform(Base) {
      return class Fixture extends Base {
        get name() {
          return `*${super.name}*`;
        }
      };
    }

    const person = {
      age: 30,
      name: "Alice",
    };
    const fixture = utilities.transformObject(FixtureTransform, person);

    // Can get properties of the base object.
    assert.equal(fixture.age, 30);

    // Can get a property that entails the mixin calling `super`.
    assert.equal(fixture.name, "*Alice*");

    // Can set that property.
    person.name = "Bob";
    assert.equal(fixture.name, "*Bob*");

    // Can set a new property that doesn't exist in the mixin or base object.
    fixture.extra = "extra";
    assert.equal(fixture.extra, "extra");

    // Checking whether the extended object has a given property includes
    // considering the base object.
    assert("age" in fixture);
    assert("extra" in fixture);
  });

  it("transformObject applies the same mixin to explorable results", async () => {
    function UppercaseTransform(Base) {
      return class Uppercase extends Base {
        async get(key) {
          const value = await super.get(key);
          return ExplorableGraph.isExplorable(value)
            ? value
            : value.toUpperCase();
        }
      };
    }
    const graph = new ObjectGraph({
      a: "a",
      more: {
        b: "b",
      },
    });
    const mixed = utilities.transformObject(UppercaseTransform, graph);
    assert.equal(await mixed.get("a"), "A");
    const mixedMore = await mixed.get("more");
    assert.equal(await mixedMore.get("b"), "B");
  });
});
