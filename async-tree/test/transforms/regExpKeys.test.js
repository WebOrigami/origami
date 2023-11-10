import assert from "node:assert";
import { describe, test } from "node:test";
import * as Tree from "../../src/Tree.js";
import regExpKeys from "../../src/transforms/regExpKeys.js";

describe("regExpKeys", () => {
  test("matches keys using regular expressions", async () => {
    const fixture = await regExpKeys(
      Tree.from({
        a: true,
        "b.*": true,
        c: {
          d: true,
          "e*": true,
        },
      })
    );
    assert(await Tree.traverse(fixture, "a"));
    assert(!(await Tree.traverse(fixture, "alice")));
    assert(await Tree.traverse(fixture, "bob"));
    assert(await Tree.traverse(fixture, "brenda"));
    assert(await Tree.traverse(fixture, "c", "d"));
    assert(await Tree.traverse(fixture, "c", "eee"));
  });
});
