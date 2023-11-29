import { ObjectTree, Tree, isStringLike } from "@graphorigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import * as utilities from "../../src/common/utilities.js";

describe("utilities", () => {
  test("isStringLike returns true for things that can act like strings", () => {
    assert(isStringLike("string"));
    assert(isStringLike(new String("string")));
    assert(isStringLike(Buffer.from("buffer")));
    assert(!isStringLike({}));
    assert(isStringLike({ toString: () => "string" }));
  });

  test("toFunction returns a plain function as is", () => {
    const fn = () => {};
    assert.equal(utilities.toFunction(fn), fn);
  });

  test("toFunction returns a tree's getter as a function", async () => {
    const tree = new ObjectTree({
      a: 1,
    });
    const fn = utilities.toFunction(tree);
    assert.equal(await fn("a"), 1);
  });

  test("toFunction can use an object's `unpack` as a function", async () => {
    const obj = {
      unpack: () => () => "result",
    };
    const fn = utilities.toFunction(obj);
    assert.equal(await fn(), "result");
  });

  test("toFunction returns a constant function for a constant", () => {
    const fn = utilities.toFunction("constant");
    assert.equal(fn(), "constant");
  });

  test("toString returns the value of an object's `@text` property", () => {
    const obj = {
      "@text": "text",
    };
    assert.equal(utilities.toString(obj), "text");
  });

  test("toString returns the value of an object's `toString` method", () => {
    const obj = {
      toString: () => "text",
    };
    assert.equal(utilities.toString(obj), "text");
  });

  test("toString returns null for an object with no useful `toString`", () => {
    const obj = {};
    assert.equal(utilities.toString(obj), null);
  });

  test("toString decodes an ArrayBuffer as UTF-8", () => {
    const buffer = Buffer.from("text", "utf8");
    assert.equal(utilities.toString(buffer), "text");
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
    const tree = new ObjectTree({
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
