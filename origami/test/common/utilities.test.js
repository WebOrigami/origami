import {
  DeepObjectTree,
  Tree,
  castArraylike,
  isStringlike,
} from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import * as utilities from "../../src/common/utilities.js";

describe("utilities", () => {
  test("castArraylike returns an object if any keys are not integers", () => {
    const values = ["a", "b", "c"];
    const keys = [0, 1, "x"];
    const result = castArraylike(keys, values);
    assert.deepEqual(result, {
      0: "a",
      1: "b",
      x: "c",
    });
  });

  test("castArraylike returns values as is if keys are numeric and 0..length-1", () => {
    const values = ["a", "b", "c"];
    const keys = [0, 1, 2];
    const result = castArraylike(keys, values);
    assert.equal(result, values);
  });

  test("castArraylike order of keys doesn't matter as long as they're all present", () => {
    const values = ["a", "b", "c"];
    const keys = [1, 0, 2];
    const result = castArraylike(keys, values);
    assert.deepEqual(result, ["a", "b", "c"]);
  });

  test("castArraylike resorts object if numeric keys are missing", () => {
    const values = ["a", "b", "c"];
    const keys = [1, 0, 3];
    const result = castArraylike(keys, values);
    assert.deepEqual(result, {
      1: "a",
      0: "b",
      3: "c",
    });
  });

  test("isStringlike returns true for things that can act like strings", () => {
    assert(isStringlike("string"));
    assert(isStringlike(new String("string")));
    assert(isStringlike(new TextEncoder().encode("string")));
    assert(!isStringlike({}));
    assert(isStringlike({ toString: () => "string" }));
  });

  test("toString returns the value of an object's `_body` property", () => {
    const obj = {
      _body: "text",
    };
    assert.equal(utilities.toString(obj), "text");
  });

  test("transformObject can apply a class mixin to a single object instance", () => {
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

  test("transformObject applies the same mixin to tree values", async () => {
    function UppercaseTransform(Base) {
      return class Uppercase extends Base {
        async get(key) {
          const value = await super.get(key);
          return Tree.isAsyncTree(value) ? value : value.toUpperCase();
        }
      };
    }
    const tree = new DeepObjectTree({
      a: "a",
      more: {
        b: "b",
        sub: {
          c: "c",
        },
      },
    });
    const mixed = utilities.transformObject(UppercaseTransform, tree);
    assert.equal(await mixed.get("a"), "A");
    const mixedMore = await mixed.get("more");
    assert.equal(await mixedMore.get("b"), "B");
    const mixedSub = await mixedMore.get("sub");
    assert.equal(await mixedSub.get("c"), "C");
  });
});
