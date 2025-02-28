import assert from "node:assert";
import { describe, test } from "node:test";
import regexMatch from "../../src/origami/regexMatch.js";

describe("regexMatch", () => {
  test("returns parsed groups", async () => {
    const result = regexMatch("2021-06-15", "^(?<date>\\d{4}-\\d{2}-\\d{2})$");
    assert.deepEqual(result, { date: "2021-06-15" });
  });
});
