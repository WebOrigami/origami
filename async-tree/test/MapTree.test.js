import assert from "node:assert";
import { describe, test } from "node:test";
import MapTree from "../src/MapTree.js";
import * as symbols from "../src/symbols.js";

describe("MapTree", () => {
  test("can get the keys of the tree", async () => {
    const fixture = createFixture();
    assert.deepEqual(Array.from(await fixture.keys()), ["a", "b", "c"]);
  });

  test("can get the value for a key", async () => {
    const fixture = createFixture();
    const a = await fixture.get("a");
    assert.equal(a, 1);
  });

  test("sets parent on subtrees", async () => {
    const map = new Map([["more", new Map([["a", 1]])]]);
    const fixture = new MapTree(map);
    const more = await fixture.get("more");
    assert.equal(more[symbols.parent], fixture);
  });

  test("can indicate which values are subtrees", async () => {
    const fixture = new MapTree([
      ["a", 1],
      ["subtree", new MapTree([["b", 2]])],
    ]);
    assert(!(await fixture.isKeyForSubtree("a")));
    assert(await fixture.isKeyForSubtree("subtree"));
    assert(await fixture.isKeyForSubtree("subtree/"));
  });

  test("adds trailing slashes to keys for subtrees", async () => {
    const tree = new MapTree([
      ["a", 1],
      ["subtree", new MapTree([["b", 2]])],
    ]);
    const keys = Array.from(await tree.keys());
    assert.deepEqual(keys, ["a", "subtree/"]);
  });

  test("can retrieve values with optional trailing slash", async () => {
    const subtree = new MapTree([["b", 2]]);
    const tree = new MapTree([
      ["a", 1],
      ["subtree", subtree],
    ]);
    assert.equal(await tree.get("a"), 1);
    assert.equal(await tree.get("a/"), 1);
    assert.equal(await tree.get("subtree"), subtree);
    assert.equal(await tree.get("subtree/"), subtree);
  });

  test("getting an unsupported key returns undefined", async () => {
    const fixture = createFixture();
    assert.equal(await fixture.get("d"), undefined);
  });
});

function createFixture() {
  const map = new Map([
    ["a", 1],
    ["b", 2],
    ["c", 3],
  ]);
  return new MapTree(map);
}
