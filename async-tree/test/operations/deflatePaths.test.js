import assert from "node:assert";
import { describe, test } from "node:test";
import deflatePaths from "../../src/operations/deflatePaths.js";

describe("deflatePaths", () => {
  test("flattens a tree into a map of string paths to values", async () => {
    const maplike = {
      foo: {
        bar: {
          "baz.json": 123,
          "qux.json": 456,
        },
        "quux.json": 789,
      },
    };
    const result = await deflatePaths(maplike);
    assert.deepStrictEqual(Object.fromEntries(result), {
      "foo/bar/baz.json": 123,
      "foo/bar/qux.json": 456,
      "foo/quux.json": 789,
    });
  });
});
