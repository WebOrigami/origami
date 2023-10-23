import assert from "node:assert";
import { describe, test } from "node:test";
import MapTree from "../src/MapTree.js";

describe("MapTree", () => {
  test("sets parent on subtrees", async () => {
    const map = new Map([["more", new Map([["a", 1]])]]);
    const fixture = new MapTree(map);
    const more = await fixture.get("more");
    assert.equal(more.parent2, fixture);
  });
});
