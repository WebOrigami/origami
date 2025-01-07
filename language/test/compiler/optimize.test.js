import assert from "node:assert";
import { describe, test } from "node:test";
import * as compile from "../../src/compiler/compile.js";
import optimize from "../../src/compiler/optimize.js";
import { ops } from "../../src/runtime/internal.js";
import { stripCodeLocations } from "./stripCodeLocations.js";

describe("optimize", () => {
  test("optimize non-local ops.scope calls to ops.external", async () => {
    const expression = `
      (name) => {
        a: 1
        b: a            // local, should be left as ops.scope
        c: elsewhere    // external, should be converted to ops.external
        d: name         // local, should be left as ops.scope
      }
    `;
    const fn = compile.expression(expression);
    const code = fn.code;
    assert.deepEqual(stripCodeLocations(code), [
      ops.lambda,
      ["name"],
      [
        ops.object,
        ["a", [ops.literal, 1]],
        ["b", [ops.scope, "a"]],
        ["c", [ops.external, "elsewhere", [ops.scope, "elsewhere"], {}]],
        ["d", [ops.scope, "name"]],
      ],
    ]);
  });

  test("optimize scope traversals with all literal keys", async () => {
    // Compilation of `x/y.js`
    const code = [ops.traverse, [ops.scope, "x/"], [ops.literal, "y.js"]];
    const optimized = optimize(code);
    assert.deepEqual(stripCodeLocations(optimized), [
      ops.external,
      "x/y.js",
      code,
      {},
    ]);
  });
});
