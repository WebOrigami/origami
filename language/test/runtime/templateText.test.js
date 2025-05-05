import assert from "node:assert";
import { describe, test } from "node:test";
import templateText from "../../src/runtime/templateText.js";

describe("templateText", () => {
  test("joins strings and values together like JavaScript", async () => {
    const a = 1;
    const b = 2;
    const result = await templateText`-${a} ${b}-`;
    assert.equal(result, "-1 2-");
  });

  test("renders an object like JavaScript", async () => {
    const object = { a: 1 };
    const result = await templateText`-${object}-`;
    assert.equal(result, "-[object Object]-");
  });
});
