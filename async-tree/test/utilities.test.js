import assert from "node:assert";
import { describe, test } from "node:test";
import * as utilities from "../src/utilities.js";

describe("utilities", () => {
  test("getRealmObjectPrototype returns the object's root prototype", () => {
    const object = {};
    const proto = utilities.getRealmObjectPrototype(object);
    assert.equal(proto, Object.prototype);
  });

  test("isPlainObject returns true if the object is a plain object", () => {
    assert.equal(utilities.isPlainObject({}), true);
    assert.equal(utilities.isPlainObject(new Object()), true);
    assert.equal(utilities.isPlainObject(Object.create(null)), true);
    class Foo {}
    assert.equal(utilities.isPlainObject(new Foo()), false);
  });

  test("keysFromPath() returns the keys from a slash-separated path", () => {
    assert.deepEqual(utilities.keysFromPath("a/b/c"), ["a", "b", "c"]);
    assert.deepEqual(utilities.keysFromPath("foo/"), ["foo", ""]);
  });

  test("naturalOrder compares strings in natural order", () => {
    const strings = ["file10", "file1", "file9"];
    strings.sort(utilities.naturalOrder);
    assert.deepEqual(strings, ["file1", "file9", "file10"]);
  });
});
