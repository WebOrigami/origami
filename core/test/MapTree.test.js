import assert from "node:assert";
import { describe, test } from "node:test";
import MapTree from "../src/MapTree.js";
import * as Tree from "../src/Tree.js";

describe("MapTree", () => {
  test("can get the keys of the tree", async () => {
    const fixture = createFixture();
    assert.deepEqual([...(await fixture.keys())], ["a", "b", "c"]);
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
    assert.equal(more.parent, fixture);
  });

  test("getting default value returns the map itself", async () => {
    const fixture = createFixture();
    assert.equal(await fixture.get(Tree.defaultValueKey), fixture.map);
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
