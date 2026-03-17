import assert from "node:assert";
import { describe, test } from "node:test";
import inflatePaths from "../../src/operations/inflatePaths.js";
import plain from "../../src/operations/plain.js";

describe("inflatePaths", () => {
  test("given a flat mapping of paths to values, returns the described tree", async () => {
    const maplike = {
      "foo/bar/baz.json": 123,
      "foo/bar/qux.json": 456,
      "foo/quux.json": 789,
    };
    const result = await inflatePaths(maplike);
    assert.deepStrictEqual(await plain(result), {
      foo: {
        bar: {
          "baz.json": 123,
          "qux.json": 456,
        },
        "quux.json": 789,
      },
    });
  });
});
