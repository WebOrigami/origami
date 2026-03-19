import assert from "node:assert";
import { describe, test } from "node:test";
import SetMap from "../../src/drivers/SetMap.js";

describe("SetMap", () => {
  test("can get the keys of the map", async () => {
    const set = new Set(["a", "b", "c"]);
    const fixture = new SetMap(set);
    assert.deepEqual(Array.from(await fixture.keys()), [0, 1, 2]);
  });

  test("can get the value for a key", async () => {
    const set = new Set(["a", "b", "c"]);
    const fixture = new SetMap(set);
    const a = await fixture.get(0);
    assert.equal(a, "a");
  });

  test("getting an unsupported key returns undefined", async () => {
    const set = new Set(["a", "b", "c"]);
    const fixture = new SetMap(set);
    assert.equal(await fixture.get(3), undefined);
  });

  test("getting a null/undefined key throws an exception", async () => {
    const set = new Set(["a", "b", "c"]);
    const fixture = new SetMap(set);
    await assert.rejects(async () => {
      await fixture.get(null);
    });
    await assert.rejects(async () => {
      await fixture.get(undefined);
    });
  });
});
