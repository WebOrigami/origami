import assert from "node:assert";
import { describe, test } from "node:test";
import SetDictionary from "../src/SetDictionary.js";

describe("SetDictionary", () => {
  test("can get the keys of the graph", async () => {
    const set = new Set(["a", "b", "c"]);
    const fixture = new SetDictionary(set);
    assert.deepEqual([...(await fixture.keys())], [0, 1, 2]);
  });

  test("can get the value for a key", async () => {
    const set = new Set(["a", "b", "c"]);
    const fixture = new SetDictionary(set);
    const a = await fixture.get(0);
    assert.equal(a, "a");
  });

  test("getting an unsupported key returns undefined", async () => {
    const set = new Set(["a", "b", "c"]);
    const fixture = new SetDictionary(set);
    assert.equal(await fixture.get(3), undefined);
  });
});
