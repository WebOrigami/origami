import assert from "node:assert";
import { describe, test } from "node:test";

import { SyncMap } from "@weborigami/async-tree";
import evaluate from "../../src/runtime/evaluate.js";
import { createCode } from "../compiler/codeHelpers.js";

describe("evaluate", () => {
  test("if object in function position isn't a function, can unpack it", async () => {
    const fn = (...args) => args.join(",");
    const packed = new String();
    /** @type {any} */ (packed).unpack = async () => fn;
    const code = createCode([packed, "a", "b", "c"]);
    const result = await evaluate(code);
    assert.equal(result, "a,b,c");
  });

  test("if function has needsState, it gets the state", async () => {
    const fn = (state) => {
      return state;
    };
    fn.needsState = true;
    const state = {};
    const code = createCode([fn]);
    const result = await evaluate(code, state);
    assert.equal(result, state);
  });

  test("if function has containerAsTarget, it gets bound to state.container", async () => {
    /** @this {import("@weborigami/async-tree").SyncOrAsyncMap} */
    const fn = function () {
      return this;
    };
    fn.containerAsTarget = true;
    const parent = new SyncMap();
    const state = { parent };
    const code = createCode([fn]);
    const result = await evaluate(code, state);
    assert.equal(result, parent);
  });
});
