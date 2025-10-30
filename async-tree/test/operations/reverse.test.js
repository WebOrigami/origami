import assert from "node:assert";
import { describe, test } from "node:test";
import keys from "../../src/operations/keys.js";
import plain from "../../src/operations/plain.js";
import reverse from "../../src/operations/reverse.js";

describe("reverse", () => {
  test("reverses a tree's top-level keys", async () => {
    const tree = {
      a: "A",
      b: "B",
      c: "C",
    };
    const reversed = await reverse(tree);
    // @ts-ignore
    assert.deepEqual(await keys(reversed), ["c", "b", "a"]);
    // @ts-ignore
    assert.deepEqual(await plain(reversed), {
      c: "C",
      b: "B",
      a: "A",
    });
  });
});
