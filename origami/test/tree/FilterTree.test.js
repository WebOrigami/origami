import { DeepObjectTree, Tree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import FilterTree from "../../src/tree/FilterTree.js";
import GlobTree from "../../src/tree/GlobTree.js";

describe("FilterTree", () => {
  test("uses keys from filter, values from tree", async () => {
    const tree = new FilterTree(
      // Tree
      new DeepObjectTree({
        a: 1,
        b: 2,
        more: {
          c: 3,
          d: 4,
        },
        extra: {
          e: 5,
        },
      }),
      // Filter
      {
        a: true,
        // Don't ask for b.
        more: {
          d: true, // Ask for d, but not c.
        },
        extra: true, // Ask for entire extra subtree.
      }
    );
    assert.deepEqual(await Tree.plain(tree), {
      a: 1,
      more: {
        d: 4,
      },
      extra: {
        e: 5,
      },
    });
  });

  // test("filter can define keys that are available but hidden in tree", async () => {
  //   const tree = new FilterTree(new FunctionTree((name) => `Hello, ${name}!`), {
  //     Alice: true,
  //     Bob: true,
  //     Carol: true,
  //   });
  //   assert.deepEqual(await Tree.plain(tree), {
  //     Alice: "Hello, Alice!",
  //     Bob: "Hello, Bob!",
  //     Carol: "Hello, Carol!",
  //   });
  // });

  test("filter be defined with globs", async () => {
    const fixture = new FilterTree(
      // Tree
      new DeepObjectTree({
        a: 1,
        b: 2,
        "hello.txt": "Hello",
        "goodbye.txt": "Goodbye",
        "something.obj": 3,
        "fn.js": `export default true;`,
        sub: {
          subsub: {
            "hola.txt": "Hola",
            "extra.junk": 4,
          },
        },
        // It would be very expensive to filter out empty trees, even if they
        // don't contain anything that matches the filter, so for now we don't.
        empty: {},
      }),
      // Filter
      new GlobTree({
        a: true,
        "*.js": true,
        "**": {
          "*.txt": true,
        },
      })
    );
    assert.deepEqual(await Tree.plain(fixture), {
      a: 1,
      "hello.txt": "Hello",
      "goodbye.txt": "Goodbye",
      "fn.js": `export default true;`,
      sub: {
        subsub: {
          "hola.txt": "Hola",
        },
      },
      empty: {},
    });
  });
});
