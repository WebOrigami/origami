import { ObjectTree, Tree } from "@graphorigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import MapValuesTree from "../../src/common/MapValuesTree.js";

describe("MapValuesTree", () => {
  test("applies a mapping function to values", async () => {
    const tree = new ObjectTree({
      a: 1,
      b: 2,
      c: 3,
      more: {
        d: 4,
        e: 5,
      },
    });
    const doubled = new MapValuesTree(tree, (value) => 2 * value, {
      deep: true,
    });
    const plain = await Tree.plain(doubled);
    assert.deepEqual(plain, {
      a: 2,
      b: 4,
      c: 6,
      more: {
        d: 8,
        e: 10,
      },
    });
  });

  test("can be told to not get values from the inner tree", async () => {
    let calledGet = false;
    class FixtureTree extends ObjectTree {
      async get(key) {
        if (key !== "more") {
          calledGet = true;
        }
        return super.get(key);
      }
    }
    const tree = new FixtureTree({
      a: 1,
      b: 2,
      c: 3,
      more: {
        d: 4,
        e: 5,
      },
    });
    const mapped = new MapValuesTree(tree, () => true, {
      deep: true,
      getValue: false,
    });
    assert.deepEqual(await Tree.plain(mapped), {
      a: true,
      b: true,
      c: true,
      more: {
        d: true,
        e: true,
      },
    });
    assert(!calledGet);
  });

  test("can define a custom name for the key in scope", async () => {
    const tree = new ObjectTree({
      a: {
        b: "b",
      },
      c: {
        d: "d",
      },
    });
    /** @this {import("@graphorigami/types").AsyncTree} */
    async function innerFn(value) {
      const custom = await this.get("custom");
      return `${custom}${value}`;
    }
    /** @this {import("@graphorigami/types").AsyncTree} */
    async function outerFn(value) {
      const map = new MapValuesTree(value, innerFn);
      return map;
    }
    const outerMap = new MapValuesTree(tree, outerFn, {
      keyName: "custom",
    });
    assert.deepEqual(await Tree.plain(outerMap), {
      a: {
        b: "ab",
      },
      c: {
        d: "cd",
      },
    });
  });
});
