import { ObjectTree, Tree } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import FileLoadersTransform from "../../src/runtime/FileLoadersTransform.js";
describe("FileLoadersTransform", () => {
  test("invokes an appropriate loader for a .json file extension", async () => {
    const json = `{ "bar": 2 }`;
    const tree = new (FileLoadersTransform(ObjectTree))({
      foo: 1, // Should be left alone
      "bar.json": json, // Should return file with `unpack` method
    });
    const numberValue = await tree.get("foo");
    assert(typeof numberValue === "number");
    assert.equal(numberValue, 1);
    const jsonFile = await tree.get("bar.json");
    assert.equal(String(jsonFile), json);
    const data = await jsonFile.unpack();
    assert.deepEqual(data, { bar: 2 });
  });

  test("input that isn't string-like is returned as is", async () => {
    const obj = { bar: 2 };
    const tree = new (FileLoadersTransform(ObjectTree))({
      foo: 1,
      "bar.json": obj,
    });
    const jsonFile = await tree.get("bar.json");
    assert.deepEqual(await Tree.plain(jsonFile), obj);
  });
});
