import { ObjectMap } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import ori from "../../src/origami/ori.js";

describe("ori builtin", () => {
  test("evaluates an expression in the context of a tree and returns result", async () => {
    const parent = new ObjectMap({
      a: 1,
      b: 2,
      c: 3,
    });
    const result = await ori(`b`, { parent });
    assert.equal(result, 2);
  });
});
