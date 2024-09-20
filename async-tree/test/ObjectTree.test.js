import assert from "node:assert";
import { describe, test } from "node:test";
import { ObjectTree, Tree } from "../src/internal.js";
import * as symbols from "../src/symbols.js";

describe("ObjectTree", () => {
  test("can get the keys of the tree", async () => {
    const fixture = createFixture();
    assert.deepEqual(Array.from(await fixture.keys()), [
      "Alice.md",
      "Bob.md",
      "Carol.md",
    ]);
  });

  test("can get the value for a key", async () => {
    const fixture = createFixture();
    const alice = await fixture.get("Alice.md");
    assert.equal(alice, "Hello, **Alice**.");
  });

  test("getting an unsupported key returns undefined", async () => {
    const fixture = createFixture();
    assert.equal(await fixture.get("xyz"), undefined);
  });

  test("getting a null/undefined key throws an exception", async () => {
    const fixture = createFixture();
    await assert.rejects(async () => {
      await fixture.get(null);
    });
    await assert.rejects(async () => {
      await fixture.get(undefined);
    });
  });

  test("can set a value", async () => {
    const tree = new ObjectTree({
      a: 1,
      b: 2,
      c: 3,
    });

    // Update existing key
    await tree.set("a", 4);

    // Delete key
    await tree.set("b", undefined);

    // Overwrite key with trailing slash
    await tree.set("c/", {});

    // New key
    await tree.set("d", 5);

    assert.deepEqual(await Tree.entries(tree), [
      ["a", 4],
      ["c/", {}],
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
    const fixture = new ObjectTree(bar);
    assert.deepEqual(await Tree.entries(fixture), [
      ["a", 1],
      ["extra", "Hello"],
      ["prop", undefined],
    ]);
    assert.equal(await fixture.get("a"), 1);
    await fixture.set("prop", "Goodbye");
    assert.equal(bar.prop, "Goodbye");
    assert.equal(await fixture.get("prop"), "Goodbye");
  });

  test("sets parent symbol on subobjects", async () => {
    const fixture = new ObjectTree({
      sub: {},
    });
    const sub = await fixture.get("sub");
    assert.equal(sub[symbols.parent], fixture);
  });

  test("sets parent on subtrees", async () => {
    const fixture = new ObjectTree({
      a: 1,
      more: new ObjectTree({
        b: 2,
      }),
    });
    const more = await fixture.get("more");
    assert.equal(more.parent, fixture);
  });

  test("can indicate which values are subtrees", async () => {
    const fixture = new ObjectTree({
      a: 1,
      subtree: new ObjectTree({
        b: 2,
      }),
    });
    assert(!(await fixture.isKeyForSubtree("a")));
    assert(await fixture.isKeyForSubtree("subtree"));
    assert(await fixture.isKeyForSubtree("subtree/"));
  });

  test("adds trailing slashes to keys for subtrees", async () => {
    const tree = new ObjectTree({
      a1: 1,
      a2: new ObjectTree({
        b1: 2,
      }),
      a3: 3,
      a4: new ObjectTree({
        b2: 4,
      }),
    });
    const keys = Array.from(await tree.keys());
    assert.deepEqual(keys, ["a1", "a2/", "a3", "a4/"]);
  });

  test("can retrieve values with optional trailing slash", async () => {
    const subtree = {
      async get(key) {},
      async keys() {},
    };
    const tree = new ObjectTree({
      a: 1,
      subtree,
    });
    assert.equal(await tree.get("a"), 1);
    assert.equal(await tree.get("a/"), undefined); // not a subtree
    assert.equal(await tree.get("subtree"), subtree);
    assert.equal(await tree.get("subtree/"), subtree);
  });

  test("method on an object is bound to the object", async () => {
    const n = new Number(123);
    const tree = new ObjectTree(n);
    const method = await tree.get("toString");
    assert.equal(method(), "123");
  });
});

function createFixture() {
  return new ObjectTree({
    "Alice.md": "Hello, **Alice**.",
    "Bob.md": "Hello, **Bob**.",
    "Carol.md": "Hello, **Carol**.",
  });
}
