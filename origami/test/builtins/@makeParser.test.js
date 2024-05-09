import assert from "node:assert";
import { describe, test } from "node:test";
import regexParser from "../../src/builtins/@regexParser.js";

describe("@makeParser", () => {
  test("returns parsed groups", async () => {
    const parser = regexParser("^(?<date>\\d{4}-\\d{2}-\\d{2})$");
    const result = parser("2021-06-15");
    assert.deepEqual(result, { date: "2021-06-15" });
  });
});
