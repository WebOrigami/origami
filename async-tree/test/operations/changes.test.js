import assert from "node:assert";
import { describe, test } from "node:test";
import changes from "../../src/operations/changes.js";

describe("changes", () => {
  test("finds changes in two trees", async () => {
    const oldTree = {
      a: {
        b: "old",
        c: "old",
        d: "old",
      },
    };
    const newTree = {
      a: {
        b: "new",
        c: "old",
      },
      e: "new",
    };
    const result = await changes(oldTree, newTree);
    assert.deepEqual(result, {
      "a/": {
        b: "changed",
        d: "deleted",
      },
      e: "added",
    });
  });

  test("returns undefined if two trees are the same", async () => {
    const tree1 = {
      a: {
        b: "same",
      },
    };
    const tree2 = structuredClone(tree1);
    const result = await changes(tree1, tree2);
    assert.strictEqual(result, undefined);
  });

  // test("uses manifests if both trees have them", async () => {
  //   const oldTree = new ObjectMap({});
  //   /** @type {any} */ (oldTree).manifest = () => ({
  //     a: "a hash",
  //     sub: {
  //       b: "b hash",
  //       c: "c hash",
  //     },
  //   });

  //   const newTree = new ObjectMap({});
  //   /** @type {any} */ (newTree).manifest = () => ({
  //     a: "a hash",
  //     sub: {
  //       c: "c hash new",
  //       d: "d hash",
  //     },
  //     e: "e hash",
  //   });

  //   const result = await changes(oldTree, newTree);
  //   assert.deepEqual(result, {
  //     "sub/": {
  //       b: "deleted",
  //       c: "changed",
  //       d: "added",
  //     },
  //     e: "added",
  //   });
  // });
});
