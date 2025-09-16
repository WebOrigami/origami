import assert from "node:assert";
import { describe, test } from "node:test";
import isPlainObject from "../../src/utilities/isPlainObject.js";

describe("isPlainObject", () => {
  test("returns true if the object is a plain object", () => {
    assert.equal(isPlainObject({}), true);
    assert.equal(isPlainObject(new Object()), true);
    assert.equal(isPlainObject(Object.create(null)), true);
    class Foo {}
    assert.equal(isPlainObject(new Foo()), false);
  });
});
