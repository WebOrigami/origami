import { Tree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import addNextPrevious from "../../src/tree/addNextPrevious.js";

describe("@addNextPrevious", () => {
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
    const result = await addNextPrevious.call(null, tree);
    assert.deepEqual(await Tree.plain(result), {
      alice: {
        name: "Alice",
        nextKey: "bob",
      },
      bob: {
        name: "Bob",
        nextKey: "carol",
        previousKey: "alice",
      },
      carol: {
        name: "Carol",
        previousKey: "bob",
      },
    });
  });

  test("upgrades text nodes to objects", async () => {});
});
