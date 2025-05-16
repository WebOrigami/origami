import { ObjectTree, symbols, Tree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";

import expressionObject from "../../src/runtime/expressionObject.js";
import { ops } from "../../src/runtime/internal.js";

describe("expressionObject", () => {
  test("can instantiate an object", async () => {
    const scope = new ObjectTree({
      upper: (s) => s.toUpperCase(),
    });

    const entries = [
      ["hello", [[[ops.scope], "upper"], "hello"]],
      ["world", [[[ops.scope], "upper"], "world"]],
    ];

    const object = await expressionObject(entries, scope);
    assert.equal(await object.hello, "HELLO");
    assert.equal(await object.world, "WORLD");
    assert.equal(object[symbols.parent], scope);
  });

  test("can define a property getter", async () => {
    let count = 0;
    const increment = () => count++;
    const entries = [["count", [ops.getter, [increment]]]];
    const object = await expressionObject(entries, null);
    assert.equal(await object.count, 0);
    assert.equal(await object.count, 1);
  });

  test("treats a getter for a primitive value as a regular property", async () => {
    const entries = [["name", [ops.getter, "world"]]];
    const object = await expressionObject(entries, null);
    assert.equal(object.name, "world");
  });

  test("can instantiate an Origami tree", async () => {
    const entries = [
      ["name", "world"],
      ["message", [ops.concat, "Hello, ", [[ops.scope], "name"], "!"]],
    ];
    const parent = new ObjectTree({});
    const object = await expressionObject(entries, parent);
    assert.deepEqual(await Tree.plain(object), {
      name: "world",
      message: "Hello, world!",
    });
    assert.equal(object[symbols.parent], parent);
  });

  test("returned object values can be unpacked", async () => {
    const entries = [["data.json", `{ "a": 1 }`]];
    const parent = new ObjectTree({});
    parent.handlers = new ObjectTree({
      "json.handler": {
        unpack: JSON.parse,
      },
    });
    const result = await expressionObject(entries, parent);
    const dataJson = await result["data.json"];
    const json = await dataJson.unpack();
    assert.deepEqual(json, { a: 1 });
  });

  test("a key declared with parentheses is not enumerable", async () => {
    const entries = [
      ["(hidden)", "shh"],
      ["visible", "hey"],
    ];
    const object = await expressionObject(entries, null);
    assert.deepEqual(Object.keys(object), ["visible"]);
    assert.equal(object["hidden"], "shh");
  });

  test("provides a symbols.keys method", async () => {
    const entries = [
      // Will return a tree, should have a slash
      ["getter", [ops.getter, [ops.object, ["b", [ops.literal, 2]]]]],
      ["hasSlash/", "This isn't really a tree but says it is"],
      ["message", "Hello"],
      // Immediate treelike value, should have a slash
      ["object", [ops.object, ["b", [ops.literal, 2]]]],
    ];
    const object = await expressionObject(entries, null);
    assert.deepEqual(object[symbols.keys](), [
      "getter/",
      "hasSlash/",
      "message",
      "object/",
    ]);
  });
});
