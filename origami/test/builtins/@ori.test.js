import { ObjectTree } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import builtins from "../../src/builtins/@builtins.js";
import ori from "../../src/builtins/@ori.js";
import Scope from "../../src/common/Scope.js";

describe("ori builtin", () => {
  test("evaluates an expression in the context of a scope and returns result", async () => {
    const tree = new ObjectTree({
      a: 1,
      b: 2,
      c: 3,
    });
    const scope = new Scope(
      {
        "@current": tree,
      },
      tree,
      builtins
    );
    const result = await ori.call(scope, `@tree/keys`);
    assert.equal(
      String(result),
      `- a
- b
- c
`
    );
  });
});
