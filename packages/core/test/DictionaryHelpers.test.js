import assert from "node:assert";
import { describe, test } from "node:test";
import * as Dictionary from "../src/Dictionary.js";
import ObjectGraph from "../src/ObjectGraph.js";

describe("Dictionary", () => {
  test("entries returns the [key, value] pairs", async () => {
    const fixture = createFixture();
    assert.deepEqual(
      [...(await Dictionary.entries(fixture))],
      [
        ["Alice.md", "Hello, **Alice**."],
        ["Bob.md", "Hello, **Bob**."],
        ["Carol.md", "Hello, **Carol**."],
      ]
    );
  });

  test("forEach invokes a callback for each entry", async () => {
    const fixture = createFixture();
    const results = {};
    await Dictionary.forEach(fixture, async (value, key) => {
      results[key] = value;
    });
    assert.deepEqual(results, {
      "Alice.md": "Hello, **Alice**.",
      "Bob.md": "Hello, **Bob**.",
      "Carol.md": "Hello, **Carol**.",
    });
  });

  test("getRealmObjectPrototype returns the object's root prototype", () => {
    const obj = new ObjectGraph({});
    const proto = Dictionary.getRealmObjectPrototype(obj);
    assert.equal(proto, Object.prototype);
  });

  test("has returns true if the key exists", async () => {
    const fixture = createFixture();
    assert.equal(await Dictionary.has(fixture, "Alice.md"), true);
    assert.equal(await Dictionary.has(fixture, "David.md"), false);
  });

  test("isAsyncDictionary returns true if the object is a dictionary", () => {
    const missingGetAndKeys = {};
    assert(!Dictionary.isAsyncDictionary(missingGetAndKeys));

    const missingIterator = {
      async get() {},
    };
    assert(!Dictionary.isAsyncDictionary(missingIterator));

    const missingGet = {
      async keys() {},
    };
    assert(!Dictionary.isAsyncDictionary(missingGet));

    const hasGetAndKeys = {
      async get() {},
      async keys() {},
    };
    assert(Dictionary.isAsyncDictionary(hasGetAndKeys));
  });

  test("isAsyncMutableDictionary returns true if the object is a mutable dictionary", () => {
    assert.equal(
      Dictionary.isAsyncMutableDictionary({
        get() {},
        keys() {},
      }),
      false
    );
    assert.equal(Dictionary.isAsyncMutableDictionary(createFixture()), true);
  });

  test("isPlainObject returns true if the object is a plain object", () => {
    assert.equal(Dictionary.isPlainObject({}), true);
    assert.equal(Dictionary.isPlainObject(new Object()), true);
    assert.equal(Dictionary.isPlainObject(Object.create(null)), true);
    assert.equal(Dictionary.isPlainObject(new ObjectGraph({})), false);
  });

  test("values returns the store's values", async () => {
    const fixture = createFixture();
    assert.deepEqual(
      [...(await Dictionary.values(fixture))],
      ["Hello, **Alice**.", "Hello, **Bob**.", "Hello, **Carol**."]
    );
  });

  test("clear removes all values", async () => {
    const fixture = createFixture();
    await Dictionary.clear(fixture);
    assert.deepEqual([...(await Dictionary.entries(fixture))], []);
  });

  test("remove method removes a value", async () => {
    const fixture = createFixture();
    await Dictionary.remove(fixture, "Alice.md");
    assert.deepEqual(
      [...(await Dictionary.entries(fixture))],
      [
        ["Bob.md", "Hello, **Bob**."],
        ["Carol.md", "Hello, **Carol**."],
      ]
    );
  });
});

function createFixture() {
  return new ObjectGraph({
    "Alice.md": "Hello, **Alice**.",
    "Bob.md": "Hello, **Bob**.",
    "Carol.md": "Hello, **Carol**.",
  });
}
