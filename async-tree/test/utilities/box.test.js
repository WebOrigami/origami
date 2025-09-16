import assert from "node:assert";
import { describe, test } from "node:test";
import box from "../../src/utilities/box.js";

describe("box", () => {
  test("returns a boxed value", () => {
    const string = "string";
    const stringObject = box(string);
    assert(stringObject instanceof String);
    assert.equal(stringObject, string);

    const number = 1;
    const numberObject = box(number);
    assert(numberObject instanceof Number);
    assert.equal(numberObject, number);

    const boolean = true;
    const booleanObject = box(boolean);
    assert(booleanObject instanceof Boolean);
    assert.equal(booleanObject, boolean);

    const object = {};
    const boxedObject = box(object);
    assert.equal(boxedObject, object);
  });
});
