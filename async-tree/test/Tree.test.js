import assert from "node:assert";
import { describe, test } from "node:test";
import MapTree from "../src/MapTree.js";
import { DeepObjectTree, ObjectTree, Tree } from "../src/internal.js";

describe("Tree", () => {
  test("assign applies one tree to another", async () => {
    const target = new DeepObjectTree({
      a: 1,
      b: 2,
      more: {
        d: 3,
      },
    });

    const source = new DeepObjectTree({
      a: 4, // Overwrite existing value
      b: undefined, // Delete
      c: 5, // Add
      more: {
        // Should leave existing `more` keys alone.
        e: 6, // Add
      },
      // Add new subtree
      extra: {
        f: 7,
      },
    });

    // Apply changes.
    const result = await Tree.assign(target, source);

    assert.equal(result, target);
    assert.deepEqual(await Tree.plain(target), {
      a: 4,
      c: 5,
      more: {
        d: 3,
        e: 6,
      },
      extra: {
        f: 7,
      },
    });
  });

  test("assign() can apply updates to an array", async () => {
    const target = new ObjectTree(["a", "b", "c"]);
    await Tree.assign(target, ["d", "e"]);
    assert.deepEqual(await Tree.plain(target), ["d", "e", "c"]);
  });

  test("clear() removes all values", async () => {
    const fixture = createFixture();
    await Tree.clear(fixture);
    assert.deepEqual(Array.from(await Tree.entries(fixture)), []);
  });

  test("entries() returns the [key, value] pairs", async () => {
    const fixture = createFixture();
    assert.deepEqual(Array.from(await Tree.entries(fixture)), [
      ["Alice.md", "Hello, **Alice**."],
      ["Bob.md", "Hello, **Bob**."],
      ["Carol.md", "Hello, **Carol**."],
    ]);
  });

  test("forEach() invokes a callback for each entry", async () => {
    const fixture = createFixture();
    const results = {};
    await Tree.forEach(fixture, async (value, key) => {
      results[key] = value;
    });
    assert.deepEqual(results, {
      "Alice.md": "Hello, **Alice**.",
      "Bob.md": "Hello, **Bob**.",
      "Carol.md": "Hello, **Carol**.",
    });
  });

  test("from() returns an async tree as is", async () => {
    const tree1 = new ObjectTree({
      a: "Hello, a.",
    });
    const tree2 = Tree.from(tree1);
    assert.equal(tree2, tree1);
  });

  test("from() uses an object's unpack() method if defined", async () => {
    const obj = new String();
    /** @type {any} */ (obj).unpack = () => ({
      a: "Hello, a.",
    });
    const tree = Tree.from(obj);
    assert.deepEqual(await Tree.plain(tree), {
      a: "Hello, a.",
    });
  });

  test("from() creates a deferred tree if unpack() returns a promise", async () => {
    const obj = new String();
    /** @type {any} */ (obj).unpack = async () => ({
      a: "Hello, a.",
    });
    const tree = Tree.from(obj);
    assert.deepEqual(await Tree.plain(tree), {
      a: "Hello, a.",
    });
  });

  test("has returns true if the key exists", async () => {
    const fixture = createFixture();
    assert.equal(await Tree.has(fixture, "Alice.md"), true);
    assert.equal(await Tree.has(fixture, "David.md"), false);
  });

  test("isAsyncTree returns true if the object is a tree", () => {
    const missingGetAndKeys = {};
    assert(!Tree.isAsyncTree(missingGetAndKeys));

    const missingIterator = {
      async get() {},
    };
    assert(!Tree.isAsyncTree(missingIterator));

    const missingGet = {
      async keys() {},
    };
    assert(!Tree.isAsyncTree(missingGet));

    const hasGetAndKeys = {
      async get() {},
      async keys() {},
    };
    assert(Tree.isAsyncTree(hasGetAndKeys));
  });

  test("isAsyncMutableTree returns true if the object is a mutable tree", () => {
    assert.equal(
      Tree.isAsyncMutableTree({
        get() {},
        keys() {},
      }),
      false
    );
    assert.equal(Tree.isAsyncMutableTree(createFixture()), true);
  });

  test("isTreelike() returns true if the argument can be cast to an async tree", () => {
    assert(!Tree.isTreelike(null));
    assert(Tree.isTreelike({}));
    assert(Tree.isTreelike([]));
    assert(Tree.isTreelike(new Map()));
    assert(Tree.isTreelike(new Set()));
  });

  test("isKeyForSubtree() returns true if the key is for a subtree", async () => {
    const tree = new DeepObjectTree({
      a: 1,
      more: {
        b: 2,
      },
    });
    assert(!(await Tree.isKeyForSubtree(tree, "a")));
    assert(await Tree.isKeyForSubtree(tree, "more"));
  });

  test("map() maps values", async () => {
    const tree = new DeepObjectTree({
      a: "Alice",
      more: {
        b: "Bob",
      },
    });
    const mapped = Tree.map(tree, (value) => value.toUpperCase());
    assert.deepEqual(await Tree.plain(mapped), {
      a: "ALICE",
      more: {
        b: "BOB",
      },
    });
  });

  test("mapReduce() can map values and reduce them", async () => {
    const tree = new DeepObjectTree({
      a: 1,
      b: 2,
      more: {
        c: 3,
      },
      d: 4,
    });
    const reduced = await Tree.mapReduce(
      tree,
      (value) => value,
      async (values) => String.prototype.concat(...values)
    );
    assert.deepEqual(reduced, "1234");
  });

  test("plain() produces a plain object version of a tree", async () => {
    const original = {
      a: 1,
      b: 2,
      c: 3,
      more: {
        d: 4,
        e: 5,
      },
    };
    const tree = new ObjectTree(original);
    const plain = await Tree.plain(tree);
    assert.deepEqual(plain, original);
  });

  test("plain() produces an array for an array-like tree", async () => {
    const original = ["a", "b", "c"];
    const tree = new ObjectTree(original);
    const plain = await Tree.plain(tree);
    assert.deepEqual(plain, original);
  });

  test("plain() leaves an array-like tree as an object if keys aren't consecutive", async () => {
    const original = {
      0: "a",
      1: "b",
      // missing
      3: "c",
    };
    const tree = new ObjectTree(original);
    const plain = await Tree.plain(tree);
    assert.deepEqual(plain, original);
  });

  test("plain() awaits async properties", async () => {
    const object = {
      get name() {
        return Promise.resolve("Alice");
      },
    };
    assert.deepEqual(await Tree.plain(object), { name: "Alice" });
  });

  test("remove method removes a value", async () => {
    const fixture = createFixture();
    await Tree.remove(fixture, "Alice.md");
    assert.deepEqual(Array.from(await Tree.entries(fixture)), [
      ["Bob.md", "Hello, **Bob**."],
      ["Carol.md", "Hello, **Carol**."],
    ]);
  });

  test("toFunction returns a function that invokes a tree's get() method", async () => {
    const tree = new ObjectTree({
      a: 1,
      b: 2,
    });
    const fn = Tree.toFunction(tree);
    assert.equal(await fn("a"), 1);
    assert.equal(await fn("b"), 2);
  });

  test("traverse() a path of keys", async () => {
    const tree = new ObjectTree({
      a1: 1,
      a2: {
        b1: 2,
        b2: {
          c1: 3,
          c2: 4,
        },
      },
    });
    assert.equal(await Tree.traverse(tree), tree);
    assert.equal(await Tree.traverse(tree, "a1"), 1);
    assert.equal(await Tree.traverse(tree, "a2", "b2", "c2"), 4);
    assert.equal(
      await Tree.traverse(tree, "a2", "doesntexist", "c2"),
      undefined
    );
  });

  test("traverse() a function with fixed number of arguments", async () => {
    const tree = (a, b) => ({
      c: "Result",
    });
    assert.equal(await Tree.traverse(tree, "a", "b", "c"), "Result");
  });

  test("traverse() from one tree into another", async () => {
    const tree = new ObjectTree({
      a: {
        b: new MapTree([
          ["c", "Hello"],
          ["d", "Goodbye"],
        ]),
      },
    });
    assert.equal(await Tree.traverse(tree, "a", "b", "c"), "Hello");
  });

  test("traversing a final empty string can unpack the last value", async () => {
    const unpackable = new String();
    /** @type {any} */ (unpackable).unpack = () => "Content";
    const tree = {
      unpackable,
    };
    const result = await Tree.traverse(tree, "unpackable", "");
    assert.equal(result, "Content");
  });

  test("traversing a final empty string returns a value as is if it's not unpackable", async () => {
    const tree = new ObjectTree({
      a: "Hello",
    });
    const result = await Tree.traverse(tree, "a", "");
    assert.equal(result, "Hello");
  });

  test("traversePath() traverses a slash-separated path", async () => {
    const tree = new ObjectTree({
      a: {
        b: {
          c: "Hello",
        },
      },
    });
    assert.equal(await Tree.traversePath(tree, "a/b/c"), "Hello");
  });

  test("values() returns the store's values", async () => {
    const fixture = createFixture();
    assert.deepEqual(Array.from(await Tree.values(fixture)), [
      "Hello, **Alice**.",
      "Hello, **Bob**.",
      "Hello, **Carol**.",
    ]);
  });
});

function createFixture() {
  return new ObjectTree({
    "Alice.md": "Hello, **Alice**.",
    "Bob.md": "Hello, **Bob**.",
    "Carol.md": "Hello, **Carol**.",
  });
}
