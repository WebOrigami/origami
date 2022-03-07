import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ExplorableObject from "../../src/core/ExplorableObject.js";
import * as utilities from "../../src/core/utilities.js";
import assert from "../assert.js";

describe("utilities", () => {
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
    const graph = new ExplorableObject({
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
    const parsed = utilities.parse(`---
a: Hello, a.
---
This is the content.
`);
    assert.deepEqual(parsed, {
      a: "Hello, a.",
      "@value": "This is the content.\n",
    });
  });
});
