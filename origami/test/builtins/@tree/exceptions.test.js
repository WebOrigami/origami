import { ObjectTree, Tree } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import exceptions from "../../../src/builtins/@tree/exceptions.js";
import InvokeFunctionsTransform from "../../../src/runtime/InvokeFunctionsTransform.js";
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
