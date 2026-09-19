import assert from "node:assert";
import { describe, test } from "node:test";
import { ObjectMap } from "../../src/internal.js";
import concat from "../../src/operations/concat.js";

describe("concat", () => {
  test("concatenates arrays", async () => {
    const result = await concat(["a", "b"], ["c", "d"]);
    assert.deepEqual(result, ["a", "b", "c", "d"]);
  });

  test("concatenates maplike objects", async () => {
    const result = await concat(
      {
        1: "a",
        2: "b",
      },
      new ObjectMap({
        0: "c",
        1: "d",
      }),
      ["e", "f"],
    );
    assert.deepEqual(result, ["a", "b", "c", "d", "e", "f"]);
  });

  test("copes with mixture of numeric and non-numeric keys", async () => {
    const result = await concat(
      ["a", "b"],
      {
        x: 1,
        y: 2,
      },
      ["c", "d"],
    );
    assert.deepEqual(
      [...result.entries()],
      [
        ["0", "a"],
        ["1", "b"],
        ["x", 1],
        ["y", 2],
        ["2", "c"],
        ["3", "d"],
      ],
    );
  });
});
