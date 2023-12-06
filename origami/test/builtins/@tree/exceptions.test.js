import { ObjectTree, Tree } from "@weborigami/async-tree";
import { InvokeFunctionsTransform } from "@weborigami/language";
import assert from "node:assert";
import { describe, test } from "node:test";
import exceptions from "../../../src/builtins/@tree/exceptions.js";

describe("exceptions", () => {
  test("returns the exceptions thrown in a tree", async () => {
    const tree = new (InvokeFunctionsTransform(ObjectTree))({
      a: "fine",
      b: () => {
        throw "b throws";
      },
      more: {
        c: "fine",
        d: () => {
          throw new TypeError("d throws");
        },
      },
    });
    const fixture = await exceptions.call(null, tree);
    assert.deepEqual(await Tree.plain(fixture), {
      b: "b throws",
      more: {
        d: "TypeError: d throws",
      },
    });
  });
});
