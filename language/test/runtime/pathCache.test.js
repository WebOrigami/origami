import { Tree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import * as pathCache from "../../src/runtime/pathCache.js";

describe("pathCache", () => {
  test("records dependencies for async calls", async () => {
    pathCache.clear();
    const c = async (input) => input.toUpperCase();
    const fixture = {
      site: async () =>
        pathCache.getOrInsertComputed("site", async () => ({
          a: await fixture.a(),
          b: await fixture.b(),
        })),
      a: async () =>
        pathCache.getOrInsertComputed("a", async () =>
          (await fixture.c())("a"),
        ),
      b: async () =>
        pathCache.getOrInsertComputed("b", async () =>
          (await fixture.c())("b"),
        ),
      c: async () => pathCache.getOrInsertComputed("c", async () => c),
    };
    const site = await fixture.site();
    const result = await Tree.plain(site);
    assert.deepEqual(result, {
      a: "A",
      b: "B",
    });
    const entries = pathCache.entries();
    assert.deepStrictEqual(entries, [
      ["c", { downstreams: ["a", "b"], value: c }],
      ["a", { downstreams: ["site"], value: "A" }],
      ["b", { downstreams: ["site"], value: "B" }],
      ["site", { value: { a: "A", b: "B" } }],
    ]);
  });
});
