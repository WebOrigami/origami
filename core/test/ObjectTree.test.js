import assert from "node:assert";
import { describe, test } from "node:test";
import * as Tree from "../src/Tree.js";
import ObjectTree from "../src/ObjectTree.js";

describe("ObjectTree", () => {
  test("creates an ObjectTree for subtrees", async () => {
    const object = {
      a: 1,
      more: {
        b: 2,
      },
    };
    const fixture = new ObjectTree(object);
    const more = await fixture.get("more");
    assert.equal(more.constructor, ObjectTree);
    const b = await more.get("b");
    assert.equal(b, 2);
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

  test("returns an ObjectTree for value that's a plain sub-object or sub-array", async () => {
    const tree = new ObjectTree({
      a: 1,
      object: {
        b: 2,
      },
      array: [3],
    });

    const object = await tree.get("object");
    assert.equal(object instanceof ObjectTree, true);
    assert.deepEqual(await Tree.plain(object), { b: 2 });

    const array = await tree.get("array");
    assert.equal(array instanceof ObjectTree, true);
    assert.deepEqual(await Tree.plain(array), [3]);
  });

  test("returns an async dictionary value as is", async () => {
    const dictionary = {
      async get(key) {
        return key === "b" ? 2 : undefined;
      },
      async keys() {
        return ["b"];
      },
    };
    const tree = new ObjectTree({
      a: 1,
      dictionary,
    });
    assert.equal(await tree.get("dictionary"), dictionary);
  });
});
