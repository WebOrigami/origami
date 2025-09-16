import assert from "node:assert";
import { describe, test } from "node:test";
import getRealmObjectPrototype from "../../src/utilities/getRealmObjectPrototype.js";

describe("getRealmObjectPrototype", () => {
  test("returns the object's root prototype", () => {
    const object = {};
    const proto = getRealmObjectPrototype(object);
    assert.equal(proto, Object.prototype);
  });
});
