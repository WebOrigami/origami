import { ObjectMap, symbols, SyncMap, Tree } from "@weborigami/async-tree";
import assert from "node:assert";
import { beforeEach, describe, test } from "node:test";

import systemCache from "../../src/cache/systemCache.js";
import expressionObject from "../../src/runtime/expressionObject.js";
import { ops } from "../../src/runtime/internal.js";
import { cachePathSymbol } from "../../src/runtime/symbols.js";

describe("expressionObject", () => {
  beforeEach(() => {
    systemCache.clear();
  });

  test("can instantiate an object", async () => {
    const parent = new ObjectMap({
      upper: (s) => s.toUpperCase(),
    });

    const entries = [
      ["hello", [[[ops.scope], "upper"], "hello"]],
      ["world", [[[ops.scope], "upper"], "world"]],
    ];
    const context = new SyncMap();

    const object = await expressionObject("test.ori/", entries, {
      object: context,
      parent,
    });
    assert.equal(await object.hello, "HELLO");
    assert.equal(await object.world, "WORLD");
    assert.equal(object[symbols.parent], context);
  });

  test("static property", async () => {
    let count = 0;
    const increment = () => count++;
    const entries = [["count", [increment]]];
    const object = await expressionObject("test.ori/", entries);
    const propertyDescriptor = Object.getOwnPropertyDescriptor(object, "count");
    assert.equal(propertyDescriptor?.value, 0);
    assert.equal(object.count, 0);
    assert.equal(count, 1); // getter should have been called
  });

  test("with caching on, property getter uses system cache", async () => {
    let count = 0;
    const increment = () => count++;
    const entries = [["count", [ops.getter, [increment]]]];
    const object = await expressionObject("test.ori/", entries);
    object[cachePathSymbol] = "foo.ori/"; // enable caching on this object tree
    assert.equal(await object.count, 0);
    const propertyDescriptor = Object.getOwnPropertyDescriptor(object, "count");
    assert(propertyDescriptor?.get); // should still be a getter
    assert.equal(count, 1); // getter should have been called
    assert.equal(await object.count, 0); // getter result should be cached
  });

  test("treats a getter for a primitive value as a regular property", async () => {
    const entries = [["name", [ops.getter, "world"]]];
    const object = await expressionObject("test.ori/", entries);
    assert.equal(object.name, "world");
  });

  test("can instantiate an Origami tree", async () => {
    const entries = [
      ["name", "world"],
      ["message", [ops.deepText, "Hello, ", [[ops.inherited, 0], "name"], "!"]],
    ];
    const context = new SyncMap();
    const object = await expressionObject("test.ori/", entries, {
      object: context,
    });
    assert.deepEqual(await Tree.plain(object), {
      name: "world",
      message: "Hello, world!",
    });
    assert.equal(object[symbols.parent], context);
  });

  test("can compute a property key", async () => {
    const entries = [
      [
        [
          ops.deepText,
          [
            [ops.inherited, 0],
            [ops.literal, "name"], // references `name` on same object
          ],
          ".json",
        ],
        1,
      ],
      ["name", "data"],
    ];
    const context = new SyncMap();
    const object = await expressionObject("test.ori/", entries, {
      object: context,
    });
    assert.deepEqual(await Tree.plain(object), {
      "data.json": 1,
      name: "data",
    });
  });

  test("returned object values can be unpacked", async () => {
    const entries = [["data.json", `{ "a": 1 }`]];
    const context = new SyncMap();
    const globals = {
      json_handler: { unpack: (data) => JSON.parse(data) },
    };
    const result = await expressionObject("test.ori/", entries, {
      object: context,
      globals,
    });
    const dataJson = await result["data.json"];
    const json = await dataJson.unpack();
    assert.deepEqual(json, { a: 1 });
  });

  test("a key declared with parentheses is not enumerable", async () => {
    const entries = [
      ["(hidden)", "shh"],
      ["visible", "hey"],
    ];
    const object = await expressionObject("test.ori/", entries);
    assert.deepEqual(Object.keys(object), ["visible"]);
    assert.equal(object["hidden"], "shh");
  });

  test("provides a symbols.keys method returning normalized keys", async () => {
    const entries = [
      // Will return a tree, should have a slash
      ["getter", [ops.getter, [ops.object, null, ["b", [ops.literal, 2]]]]],
      ["hasSlash/", "This isn't really a tree but says it is"],
      ["message", "Hello"],
      // Immediate maplike value, should have a slash
      ["object", [ops.object, null, ["b", [ops.literal, 2]]]],
      // Computed key
      [[ops.deepText, [ops.array, "data", ".json"]], 1],
    ];
    const object = await expressionObject("test.ori/", entries);
    assert.deepEqual(object[symbols.keys](), [
      "getter/",
      "hasSlash/",
      "message",
      "object/",
      "data.json",
    ]);
  });

  test("tracks dependencies on upstream values", async () => {
    systemCache.clear();

    // The `number` property gets a value from the cache
    const getNumber = () =>
      systemCache.getOrInsertComputed("dependency", () => 1);
    const entries = [["number", [ops.getter, [getNumber]]]];
    const object = await expressionObject("test.ori/", entries);
    object[cachePathSymbol] = "src/test.ori/"; // enable caching on this object tree
    const number = await object.number;
    assert.equal(number, 1);

    const dependencyEntry = systemCache.get("dependency");
    const objectEntry = systemCache.get("src/test.ori/number");
    assert(dependencyEntry.downstreams.has("src/test.ori/number"));
    assert(objectEntry.upstreams.has("dependency"));
  });

  test("generates a unique cache path for an unattached object", async () => {
    const object0 = await expressionObject("test.ori/_objects/", [["a", 1]]);
    assert.equal(object0[cachePathSymbol], "test.ori/_objects/0/");
    const object1 = await expressionObject("test.ori/_objects/", [["a", 1]]);
    assert.equal(object1[cachePathSymbol], "test.ori/_objects/1/");
  });
});
