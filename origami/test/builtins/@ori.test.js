import { ObjectTree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import builtins from "../../src/builtins/@builtins.js";
import ori from "../../src/builtins/@ori.js";

describe("ori builtin", () => {
  test("evaluates an expression in the context of a tree and returns result", async () => {
    const tree = new ObjectTree({
      a: 1,
      b: 2,
      c: 3,
    });
    tree.parent = builtins;
    const ambients = new ObjectTree({
      "@current": tree,
    });
    ambients.parent = tree;
    const result = await ori.call(ambients, `@keys`);
    assert.equal(
      String(result),
      `- a
- b
- c
`
    );
  });
});
