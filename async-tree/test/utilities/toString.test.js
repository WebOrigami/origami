import assert from "node:assert";
import { describe, test } from "node:test";
import toString from "../../src/utilities/toString.js";

describe("toString", () => {
  test("returns the value of an object's `toString` method", () => {
    const object = {
      toString: () => "text",
    };
    assert.equal(toString(object), "text");
  });

  test("returns null for an object with no useful `toString`", () => {
    const object = {};
    assert.equal(toString(object), null);
  });

  test("decodes an ArrayBuffer as UTF-8", () => {
    const arrayBuffer = new TextEncoder().encode("text").buffer;
    assert.equal(toString(arrayBuffer), "text");
  });
});
