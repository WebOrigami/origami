import { ExplorableGraph } from "../../exports.js";
import ExplorableObject from "../../src/core/ExplorableObject.js";
import * as utilities from "../../src/core/utilities.js";
import assert from "../assert.js";

describe("utilities", () => {
  it("applyMixinToObject can apply a class mixin to a single object instance", () => {
    function FixtureMixin(Base) {
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
    const fixture = utilities.applyMixinToObject(FixtureMixin, person);

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

  it("applyMixinToGraph applies the same mixin to explorable results", async () => {
    function UppercaseMixin(Base) {
      return class Uppercase extends Base {
        async get(...keys) {
          const value = await super.get(...keys);
          return ExplorableGraph.isExplorable(value)
            ? Reflect.construct(this.constructor, [value])
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
    const mixed = utilities.applyMixinToGraph(UppercaseMixin, graph);
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
      a: "Hello, a.",
      content: "This is the content.\n",
    });
  });

  it("extractFrontMatter returns null if no front matter is found", () => {
    const text = "a: Hello, a.";
    assert.isNull(utilities.extractFrontMatter(text));
  });
});
