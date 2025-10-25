import assert from "node:assert";
import { describe, test } from "node:test";
import ObjectMap from "../../src/drivers/ObjectMap.js";
import plain from "../../src/operations/plain.js";

describe("plain", () => {
  test("produces a plain object version of a tree", async () => {
    const tree = new ObjectMap({
      a: 1,
      // Slashes should be normalized
      "sub1/": {
        b: 2,
      },
      sub2: {
        c: 3,
      },
    });
    assert.deepEqual(await plain(tree), {
      a: 1,
      sub1: {
        b: 2,
      },
      sub2: {
        c: 3,
      },
    });
  });

  test("produces an array for an array-like tree", async () => {
    const original = ["a", "b", "c"];
    const tree = new ObjectMap(original);
    assert.deepEqual(await plain(tree), original);
  });

  test("leaves an array-like tree as an object if keys aren't consecutive", async () => {
    const original = {
      0: "a",
      1: "b",
      // missing
      3: "c",
    };
    const tree = new ObjectMap(original);
    assert.deepEqual(await plain(tree), original);
  });

  test("returns empty array or object for ObjectMap as necessary", async () => {
    const tree = new ObjectMap({});
    assert.deepEqual(await plain(tree), {});
    const arrayTree = new ObjectMap([]);
    assert.deepEqual(await plain(arrayTree), []);
  });

  test("awaits async properties", async () => {
    const object = {
      get name() {
        return Promise.resolve("Alice");
      },
    };
    assert.deepEqual(await plain(object), { name: "Alice" });
  });

  test("coerces TypedArray values to strings", async () => {
    const tree = new ObjectMap({
      a: new TextEncoder().encode("Hello, world."),
    });
    const result = await plain(tree);
    assert.equal(result.a, "Hello, world.");
  });
});
