import assert from "node:assert";
import { describe, test } from "node:test";
import DeepObjectMap from "../../src/drivers/DeepObjectMap.js";
import regExpKeys from "../../src/operations/regExpKeys.js";
import traverse from "../../src/operations/traverse.js";

describe("regExpKeys", () => {
  test("matches keys using regular expressions", async () => {
    const fixture = await regExpKeys(
      new DeepObjectMap({
        "^a$": true,
        "^b.*": true,
        c: {
          d: true,
          "e*": true,
        },
        f: true,
      })
    );
    assert(await traverse(fixture, "a"));
    assert(!(await traverse(fixture, "alice")));
    assert(await traverse(fixture, "bob"));
    assert(await traverse(fixture, "brenda"));
    assert(await traverse(fixture, "c/", "d"));
    assert(await traverse(fixture, "c/", "eee"));
    assert(await traverse(fixture, "f"));
    assert(await traverse(fixture, "stef")); // contains "f"
    assert(!(await traverse(fixture, "gail")));
  });
});
