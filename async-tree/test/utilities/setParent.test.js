import assert from "node:assert";
import { describe, test } from "node:test";
import ObjectTree from "../../src/drivers/ObjectTree.js";
import * as symbols from "../../src/symbols.js";
import setParent from "../../src/utilities/setParent.js";

describe("setParent", () => {
  test("sets a child's parent", () => {
    const parent = new ObjectTree({});

    // Set [symbols.parent] on a plain object.
    const object = {};
    setParent(object, parent);
    assert.equal(object[symbols.parent], parent);

    // Leave [symbols.parent] alone if it's already set.
    const childWithParent = {
      [symbols.parent]: "parent",
    };
    setParent(childWithParent, parent);
    assert.equal(childWithParent[symbols.parent], "parent");

    // Set `parent` on a tree.
    const tree = new ObjectTree({});
    setParent(tree, parent);
    assert.equal(tree.parent, parent);

    // Leave `parent` alone if it's already set.
    const treeWithParent = new ObjectTree({});
    treeWithParent.parent = "parent";
    setParent(treeWithParent, parent);
    assert.equal(treeWithParent.parent, "parent");
  });
});
