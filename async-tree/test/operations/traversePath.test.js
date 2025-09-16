import assert from "node:assert";
import { describe, test } from "node:test";
import traversePath from "../../src/operations/traversePath.js";

describe("traversePath", () => {
  test("traversePath() traverses a slash-separated path", async () => {
    const tree = {
      a: {
        b: {
          c: "Hello",
        },
      },
    };
    assert.equal(await traversePath(tree, "a/b/c"), "Hello");
  });
});
