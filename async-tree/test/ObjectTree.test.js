import assert from "node:assert";
import { describe, test } from "node:test";
import ObjectTree from "../src/ObjectTree.js";
import * as Tree from "../src/Tree.js";

describe("ObjectTree", () => {
  test("can get the keys of the tree", async () => {
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

  test("getting an unsupported key returns undefined", async () => {
    const fixture = createFixture();
    assert.equal(await fixture.get("xyz"), undefined);
  });

  test("can set a value", async () => {
    const tree = new ObjectTree({
      a: 1,
      b: 2,
      c: 3,
    });

    // Update existing key.
    await tree.set("a", 4);

    // New key.
    await tree.set("d", 5);

    // Delete key.
    await tree.set("b", undefined);

    assert.deepEqual(await Tree.entries(tree), [
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

  test("isKeyForSubtree() indicates which values are subtrees", async () => {
    const tree = new ObjectTree({
      a1: 1,
      a2: {
        b1: 2,
      },
      a3: 3,
      a4: {
        b2: 4,
      },
    });
    const keys = Array.from(await tree.keys());
    const subtrees = await Promise.all(
      keys.map(async (key) => await tree.isKeyForSubtree(key))
    );
    assert.deepEqual(subtrees, [false, true, false, true]);
  });

  test("returns an async tree value as is", async () => {
    const subtree = {
      async get(key) {},
      async keys() {},
    };
    const tree = new ObjectTree({
      subtree,
    });
    assert.equal(await tree.get("subtree"), subtree);
  });
});

function createFixture() {
  return new ObjectTree({
    "Alice.md": "Hello, **Alice**.",
    "Bob.md": "Hello, **Bob**.",
    "Carol.md": "Hello, **Carol**.",
  });
}
