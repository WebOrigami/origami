import assert from "node:assert";
import { describe, test } from "node:test";
import { ObjectTree } from "../src/internal.js";
import * as symbols from "../src/symbols.js";
import * as utilities from "../src/utilities.js";

describe("utilities", () => {
  test("box returns a boxed value", () => {
    const string = "string";
    const stringObject = utilities.box(string);
    assert(stringObject instanceof String);
    assert.equal(stringObject, string);

    const number = 1;
    const numberObject = utilities.box(number);
    assert(numberObject instanceof Number);
    assert.equal(numberObject, number);

    const boolean = true;
    const booleanObject = utilities.box(boolean);
    assert(booleanObject instanceof Boolean);
    assert.equal(booleanObject, boolean);

    const object = {};
    const boxedObject = utilities.box(object);
    assert.equal(boxedObject, object);
  });

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
    assert.deepEqual(utilities.keysFromPath(""), []);
    assert.deepEqual(utilities.keysFromPath("/"), []);
    assert.deepEqual(utilities.keysFromPath("a/b/c"), ["a/", "b/", "c"]);
    assert.deepEqual(utilities.keysFromPath("a/b/c/"), ["a/", "b/", "c/"]);
    assert.deepEqual(utilities.keysFromPath("/foo/"), ["foo/"]);
    assert.deepEqual(utilities.keysFromPath("a///b"), ["a/", "b"]);
  });

  test("naturalOrder compares strings in natural order", () => {
    const strings = ["file10", "file1", "file9"];
    strings.sort(utilities.naturalOrder);
    assert.deepEqual(strings, ["file1", "file9", "file10"]);
  });

  test("pathFromKeys() returns a slash-separated path from keys", () => {
    assert.equal(utilities.pathFromKeys([]), "");
    assert.equal(utilities.pathFromKeys(["a", "b", "c"]), "a/b/c");
    assert.equal(utilities.pathFromKeys(["a/", "b/", "c"]), "a/b/c");
    assert.equal(utilities.pathFromKeys(["a/", "b/", "c/"]), "a/b/c/");
  });

  test("pipeline applies a series of functions to a value", async () => {
    const addOne = (n) => n + 1;
    const double = (n) => n * 2;
    const square = (n) => n * n;
    const result = await utilities.pipeline(1, addOne, double, square);
    assert.equal(result, 16);
  });

  test("setParent sets a child's parent", () => {
    const parent = new ObjectTree({});

    // Set [symbols.parent] on a plain object.
    const object = {};
    utilities.setParent(object, parent);
    assert.equal(object[symbols.parent], parent);

    // Leave [symbols.parent] alone if it's already set.
    const childWithParent = {
      [symbols.parent]: "parent",
    };
    utilities.setParent(childWithParent, parent);
    assert.equal(childWithParent[symbols.parent], "parent");

    // Set `parent` on a tree.
    const tree = new ObjectTree({});
    utilities.setParent(tree, parent);
    assert.equal(tree.parent, parent);

    // Leave `parent` alone if it's already set.
    const treeWithParent = new ObjectTree({});
    treeWithParent.parent = "parent";
    utilities.setParent(treeWithParent, parent);
    assert.equal(treeWithParent.parent, "parent");
  });

  test("toFunction returns a plain function as is", () => {
    const fn = () => {};
    assert.equal(utilities.toFunction(fn), fn);
  });

  test("toFunction returns a tree's getter as a function", async () => {
    const tree = new ObjectTree({
      a: 1,
    });
    const fn = utilities.toFunction(tree);
    assert.equal(await fn("a"), 1);
  });

  test("toFunction can use a packed object's `unpack` as a function", async () => {
    const obj = new String();
    /** @type {any} */ (obj).unpack = () => () => "result";
    const fn = utilities.toFunction(obj);
    assert.equal(await fn(), "result");
  });

  test("toFunction returns null for something that's not a function", () => {
    const result = utilities.toFunction("this is not a function");
    assert.equal(result, null);
  });

  test("toPlainValue returns the plainest representation of an object", async () => {
    class User {
      constructor(name) {
        this.name = name;
      }
    }

    assert.equal(await utilities.toPlainValue(1), 1);
    assert.equal(await utilities.toPlainValue("string"), "string");
    assert.deepEqual(await utilities.toPlainValue({ a: 1 }), { a: 1 });
    assert.equal(
      await utilities.toPlainValue(new TextEncoder().encode("bytes")),
      "bytes"
    );
    // ArrayBuffer with non-printable characters should be returned as base64
    assert.equal(
      await utilities.toPlainValue(new Uint8Array([1, 2, 3]).buffer),
      "AQID"
    );
    assert.equal(await utilities.toPlainValue(async () => "result"), "result");
    assert.deepEqual(await utilities.toPlainValue(new User("Alice")), {
      name: "Alice",
    });
  });

  test("toString returns the value of an object's `toString` method", () => {
    const object = {
      toString: () => "text",
    };
    assert.equal(utilities.toString(object), "text");
  });

  test("toString returns null for an object with no useful `toString`", () => {
    const object = {};
    assert.equal(utilities.toString(object), null);
  });

  test("toString decodes an ArrayBuffer as UTF-8", () => {
    const arrayBuffer = new TextEncoder().encode("text").buffer;
    assert.equal(utilities.toString(arrayBuffer), "text");
  });
});
