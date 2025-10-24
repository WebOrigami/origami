import assert from "node:assert";
import { describe, test } from "node:test";
import AsyncMap from "../../src/drivers/AsyncMap.js";
import sync from "../../src/operations/sync.js";

class SampleAsyncMap extends AsyncMap {
  constructor(iterable) {
    super();
    this.map = new Map(iterable);
  }

  async get(key) {
    return this.map.get(key);
  }

  async *keys() {
    yield* this.map.keys();
  }
}

describe("sync", () => {
  test("converts an async tree to a sync tree", async () => {
    const fixture = new SampleAsyncMap([
      ["a", 1],
      ["b", 2],
      [
        "more",
        new SampleAsyncMap([
          ["c", 3],
          ["d", 4],
        ]),
      ],
    ]);
    const result = await sync(fixture);
    assert(result instanceof Map);
    assert.strictEqual(result.get("a"), 1);
    assert.strictEqual(result.get("b"), 2);
    const more = result.get("more");
    assert(more instanceof Map);
    assert.strictEqual(more.get("c"), 3);
    assert.strictEqual(more.get("d"), 4);
  });
});
