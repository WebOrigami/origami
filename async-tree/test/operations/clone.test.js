import assert from "node:assert";
import { describe, test } from "node:test";
import clone from "../../src/operations/clone.js";
import plain from "../../src/operations/plain.js";

describe("clone", () => {
  test("copies a tree", async () => {
    // @ts-ignore
    const original = new Map([
      ["a", 1],
      ["b", 2],
      [
        "sub",
        // @ts-ignore
        new Map([
          ["c", 3],
          ["d", 4],
        ]),
      ],
    ]);
    const cloned = await clone(original);
    assert.deepStrictEqual(await plain(cloned), await plain(original));
    assert.notStrictEqual(cloned, original);
    assert.notStrictEqual(cloned.get("sub"), original.get("sub"));

    original.set("a", 42);
    assert.equal(cloned.get("a"), 1);
  });
});
