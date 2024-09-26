import { ObjectTree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";

import { evaluate, ops } from "../../src/runtime/internal.js";

describe("ops", () => {
  test("ops.concat concatenates tree value text", async () => {
    const scope = new ObjectTree({
      name: "world",
    });

    const code = createCode([ops.concat, "Hello, ", [ops.scope, "name"], "."]);

    const result = await evaluate.call(scope, code);
    assert.equal(result, "Hello, world.");
  });

  test("ops.constructor returns a constructor", async () => {
    const scope = new ObjectTree({
      "@js": {
        Number: Number,
      },
    });
    const fn = await ops.constructor.call(scope, "@js", "Number");
    const number = fn("1");
    assert(number instanceof Number);
    assert.equal(number, 1);
  });

  test("ops.inherited searches inherited scope", async () => {
    const parent = new ObjectTree({
      a: 1, // This is the inherited value we want
    });
    /** @type {any} */
    const child = new ObjectTree({
      a: 2, // Should be ignored
    });
    child.parent = parent;
    const code = createCode([ops.inherited, "a"]);
    const result = await evaluate.call(child, code);
    assert.equal(result, 1);
  });

  test("ops.lambda defines a function", async () => {
    const scope = new ObjectTree({
      message: "Hello",
    });

    const code = createCode([ops.lambda, null, [ops.scope, "message"]]);

    const fn = await evaluate.call(scope, code);
    const result = await fn.call(scope);
    assert.equal(result, "Hello");
  });

  test("ops.lambda adds input to scope as `_`", async () => {
    const code = createCode([ops.lambda, null, [ops.scope, "_"]]);
    const fn = await evaluate.call(null, code);
    const result = await fn("Hello");
    assert.equal(result, "Hello");
  });

  test("ops.lambda adds input parameters to scope", async () => {
    const code = createCode([
      ops.lambda,
      ["a", "b"],
      [ops.concat, [ops.scope, "b"], [ops.scope, "a"]],
    ]);
    const fn = await evaluate.call(null, code);
    const result = await fn("x", "y");
    assert.equal(result, "yx");
  });

  test("ops.lambda function can reference itself with @recurse", async () => {
    const code = createCode([ops.lambda, null, [ops.scope, "@recurse"]]);
    const fn = await evaluate.call(null, code);
    const result = await fn();
    // We're expecting the function to return itself, but testing recursion is
    // messy. We just confirm that the result has the same code as the original.
    assert.equal(result.code, fn.code);
  });

  test("ops.object instantiates an object", async () => {
    const scope = new ObjectTree({
      upper: (s) => s.toUpperCase(),
    });

    const code = createCode([
      ops.object,
      ["hello", [[ops.scope, "upper"], "hello"]],
      ["world", [[ops.scope, "upper"], "world"]],
    ]);

    const result = await evaluate.call(scope, code);
    assert.equal(result.hello, "HELLO");
    assert.equal(result.world, "WORLD");
  });

  test("ops.object instantiates an array", async () => {
    const scope = new ObjectTree({
      upper: (s) => s.toUpperCase(),
    });
    const code = createCode([
      ops.array,
      "Hello",
      1,
      [[ops.scope, "upper"], "world"],
    ]);
    const result = await evaluate.call(scope, code);
    assert.deepEqual(result, ["Hello", 1, "WORLD"]);
  });
});

/**
 * @returns {import("../../index.ts").Code}
 */
function createCode(array) {
  const code = array;
  /** @type {any} */ (code).location = {
    source: {
      text: "",
    },
  };
  return code;
}
