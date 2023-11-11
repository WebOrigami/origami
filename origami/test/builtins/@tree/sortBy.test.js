import { Tree } from "@graphorigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import sortBy from "../../../src/builtins/@tree/sortBy.js";

describe("@tree/sortBy", () => {
  test("sorts keys using a provided sort function", async () => {
    const tree = {
      Alice: { age: 48 },
      Bob: { age: 36 },
      Carol: { age: 42 },
    };
    const sorted = await sortBy.call(
      null,
      tree,
      /** @this {import("@graphorigami/types").AsyncTree} */
      function (value, key, tree) {
        return Tree.traverse(this, "_", "age");
      }
    );
    assert.deepEqual(Array.from(await sorted.keys()), [
      "Bob",
      "Carol",
      "Alice",
    ]);
  });
});
