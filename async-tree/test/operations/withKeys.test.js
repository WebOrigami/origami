import assert from "node:assert";
import { describe, test } from "node:test";
import plain from "../../src/operations/plain.js";
import withKeys from "../../src/operations/withKeys.js";

describe("withKeys", () => {
  test("applies the indicated keys", async () => {
    const result = await withKeys(
      {
        a: 1,
        b: 2,
        c: 3,
      },
      ["a", "c"]
    );
    assert.deepEqual(await plain(result), {
      a: 1,
      c: 3,
    });
  });
});
