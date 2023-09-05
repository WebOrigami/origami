import assert from "node:assert";
import { describe, test } from "node:test";
import * as DictionaryHelpers from "../src/DictionaryHelpers.js";
import * as GraphHelpers from "../src/GraphHelpers.js";
import ObjectDictionary from "../src/ObjectDictionary.js";

describe("ObjectDictionary", () => {
  test("can get the keys of the dictionary", async () => {
    const fixture = createFixture();
    assert.deepEqual(
      [...(await fixture.keys())],
      ["Alice.md", "Bob.md", "Carol.md"]
    );
  });

  test("can get the value for a key", async () => {
    const fixture = createFixture();
    const alice = await fixture.get("Alice.md");
    assert.equal(alice, "Hello, **Alice**.");
  });

  test("default value is the graph itself", async () => {
    const fixture = createFixture();
    assert.equal(await fixture.get(GraphHelpers.defaultValueKey), fixture);
  });

  test("getting an unsupported key returns undefined", async () => {
    const fixture = createFixture();
    assert.equal(await fixture.get("xyz"), undefined);
  });

  test("can set a value", async () => {
    const graph = new ObjectDictionary({
      a: 1,
      b: 2,
      c: 3,
    });

    // Update existing key.
    await graph.set("a", 4);

    // New key.
    await graph.set("d", 5);

    // Delete key.
    await graph.set("b", undefined);

    assert.deepEqual(await DictionaryHelpers.entries(graph), [
      ["a", 4],
      ["c", 3],
      ["d", 5],
    ]);
  });

  test("can wrap a class instance", async () => {
    class Foo {
      constructor() {
        this.a = 1;
      }

      get prop() {
        return this._prop;
      }
      set prop(prop) {
        this._prop = prop;
      }
    }
    class Bar extends Foo {
      method() {}
    }
    const bar = new Bar();
    /** @type {any} */ (bar).extra = "Hello";
    const fixture = new ObjectDictionary(bar);
    assert.deepEqual(await DictionaryHelpers.entries(fixture), [
      ["a", 1],
      ["extra", "Hello"],
      ["prop", undefined],
    ]);
    assert.equal(await fixture.get("a"), 1);
    await fixture.set("prop", "Goodbye");
    assert.equal(bar.prop, "Goodbye");
    assert.equal(await fixture.get("prop"), "Goodbye");
  });
});

function createFixture() {
  return new ObjectDictionary({
    "Alice.md": "Hello, **Alice**.",
    "Bob.md": "Hello, **Bob**.",
    "Carol.md": "Hello, **Carol**.",
  });
}
