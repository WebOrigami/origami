import assert from "node:assert";
import { describe, test } from "node:test";
import addNextPrevious from "../../src/operations/addNextPrevious.js";

describe("addNextPrevious", () => {
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
    const result = await addNextPrevious(tree);
    assert.deepEqual(result, {
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

  test("returns a non-object value as a 'value' property", async () => {
    const array = ["Alice", "Bob", "Carol"];
    const result = await addNextPrevious(array);
    assert.deepEqual(result, [
      {
        value: "Alice",
        nextKey: "1",
      },
      {
        value: "Bob",
        nextKey: "2",
        previousKey: "0",
      },
      {
        value: "Carol",
        previousKey: "1",
      },
    ]);
  });
});
