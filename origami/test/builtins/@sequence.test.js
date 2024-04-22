import { Tree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import sequence from "../../src/builtins/@sequence.js";

describe("@sequence", () => {
  test("adds next/previous properties to values", async () => {
    const tree = {
      alice: {
        name: "Alice",
      },
      bob: {
        name: "Bob",
      },
      carol: {
        name: "Carol",
      },
    };
    const result = await sequence.call(null, tree);
    assert.deepEqual(await Tree.plain(result), {
      alice: {
        name: "Alice",
        nextKey: "bob",
        previousKey: undefined,
      },
      bob: {
        name: "Bob",
        nextKey: "carol",
        previousKey: "alice",
      },
      carol: {
        name: "Carol",
        nextKey: undefined,
        previousKey: "bob",
      },
    });
  });
});
