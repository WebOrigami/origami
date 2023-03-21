import ori from "../../src/builtins/@ori.js";
import builtins from "../../src/cli/builtins.js";
import Scope from "../../src/common/Scope.js";
import ObjectGraph from "../../src/core/ObjectGraph.js";
import assert from "../assert.js";

describe("ori builtin", () => {
  it("evaluates an expression in the context of a scope and returns result", async () => {
    const graph = new ObjectGraph({
      a: 1,
      b: 2,
      c: 3,
    });
    const scope = new Scope(
      {
        "@defaultGraph": graph,
      },
      graph,
      builtins
    );
    const result = await ori.call(scope, `keys`);
    assert.equal(
      String(result),
      `- a
- b
- c
`
    );
  });
});
