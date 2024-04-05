import { ObjectTree, Tree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import HandleExtensionsTransform from "../../src/runtime/HandleExtensionsTransform.js";
import Scope from "../../src/runtime/Scope.js";

describe("HandleExtensionsTransform", () => {
  test("invokes an appropriate loader for a .json file extension", async () => {
    const fixture = createFixture();
    const numberValue = await fixture.get("foo");
    assert(typeof numberValue === "number");
    assert.equal(numberValue, 1);
    const jsonFile = await fixture.get("bar.json");
    assert.equal(String(jsonFile), `{ "bar": 2 }`);
    const data = await jsonFile.unpack();
    assert.deepEqual(data, { bar: 2 });
  });

  test("input that isn't string-like is returned as is", async () => {
    const obj = { bar: 2 };
    const fixture = createFixture();
    const jsonFile = await fixture.get("bar.json");
    assert.deepEqual(await Tree.plain(jsonFile), obj);
  });
});

function createFixture() {
  /** @type {import("@weborigami/types").AsyncTree} */
  let tree = new (HandleExtensionsTransform(ObjectTree))({
    foo: 1, // No extension, should be left alone
    "bar.json": `{ "bar": 2 }`,
  });
  /** @type {any} */
  const scope = new ObjectTree({
    json_handler: {
      unpack: (buffer) => JSON.parse(String(buffer)),
    },
  });
  tree = Scope.treeWithScope(tree, scope);
  return tree;
}
