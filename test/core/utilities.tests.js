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
    assert.equal(person.age, 30);

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
