import assert from "node:assert";
import { describe, test } from "node:test";
import naturalOrder from "../../src/utilities/naturalOrder.js";

describe("naturalOrder", () => {
  test("compares strings in natural order", () => {
    const strings = ["file10", "file1", "file9"];
    strings.sort(naturalOrder);
    assert.deepEqual(strings, ["file1", "file9", "file10"]);
  });
});
