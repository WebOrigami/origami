import { ExplorableObject } from "../../exports.js";
import ori from "../../src/builtins/ori.js";
import builtins from "../../src/cli/builtins.js";
import Scope from "../../src/common/Scope.js";
import assert from "../assert.js";

describe("ori builtin", () => {
  it("evaluates an expression in the context of a scope and returns text result", async () => {
    const graph = new ExplorableObject({
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
    assert.equal(result, [
      `- a
- b
- c
`,
    ]);
  });

  it("evaluates an expression in the context of a specific path", async () => {
    const graph = new ExplorableObject({
      folder: {
        message: "Hello",
      },
    });
    const scope = new Scope(
      {
        "@defaultGraph": graph,
      },
      graph,
      builtins
    );
    const result = await ori.call(scope, `message`, "folder");
    assert.equal(result, "Hello\n");
  });
});
