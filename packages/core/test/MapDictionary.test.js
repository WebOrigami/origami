import assert from "node:assert";
import { describe, test } from "node:test";
import MapDictionary from "../src/MapDictionary.js";

describe("MapDictionary", () => {
  test("can get the keys of the graph", async () => {
    const fixture = createFixture();
    assert.deepEqual([...(await fixture.keys())], ["a", "b", "c"]);
  });

  test("can get the value for a key", async () => {
    const fixture = createFixture();
    const a = await fixture.get("a");
    assert.equal(a, 1);
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
  return new MapDictionary(map);
}
