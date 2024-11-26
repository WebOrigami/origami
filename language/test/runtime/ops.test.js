import { ObjectTree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";

import { evaluate, ops } from "../../src/runtime/internal.js";

describe("ops", () => {
  test("ops.array creates an array", async () => {
    const code = createCode([ops.array, 1, 2, 3]);
    const result = await evaluate.call(null, code);
    assert.deepEqual(result, [1, 2, 3]);
  });

  test("ops.builtin gets a value from the top of the scope chain", async () => {
    const root = new ObjectTree({
      a: 1,
    });
    const tree = new ObjectTree({});
    tree.parent = root;
    const code = createCode([ops.builtin, "a"]);
    const result = await evaluate.call(tree, code);
    assert.strictEqual(result, 1);
  });

  test("ops.concat concatenates tree value text", async () => {
    const scope = new ObjectTree({
      name: "world",
    });

    const code = createCode([ops.concat, "Hello, ", [ops.scope, "name"], "."]);

    const result = await evaluate.call(scope, code);
    assert.strictEqual(result, "Hello, world.");
  });

  test("ops.conditional", async () => {
    assert.strictEqual(await ops.conditional(true, trueFn, falseFn), true);
    assert.strictEqual(await ops.conditional(true, falseFn, trueFn), false);
    assert.strictEqual(await ops.conditional(false, trueFn, falseFn), false);
    assert.strictEqual(await ops.conditional(false, falseFn, trueFn), true);

    // Short-circuiting
    assert.strictEqual(await ops.conditional(false, errorFn, trueFn), true);
  });

  test("ops.equal", async () => {
    assert.strictEqual(await ops.equal(1, 1), true);
    assert.strictEqual(await ops.equal(1, 2), false);
    assert.strictEqual(await ops.equal("1", 1), true);
    assert.strictEqual(await ops.equal("1", "1"), true);
    assert.strictEqual(await ops.equal(null, undefined), true);
  });

  test("ops.external looks up a value in scope and memoizes it", async () => {
    let count = 0;
    const tree = new ObjectTree({
      get count() {
        return ++count;
      },
    });
    const code = createCode([ops.external, "count", {}]);
    const result = await evaluate.call(tree, code);
    assert.strictEqual(result, 1);
    const result2 = await evaluate.call(tree, code);
    assert.strictEqual(result2, 1);
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
    assert.strictEqual(result, 1);
  });

  test("ops.lambda defines a function with no inputs", async () => {
    const code = createCode([ops.lambda, [], [ops.literal, "result"]]);
    const fn = await evaluate.call(null, code);
    const result = await fn.call();
    assert.strictEqual(result, "result");
  });

  test("ops.lambda defines a function with underscore input", async () => {
    const scope = new ObjectTree({
      message: "Hello",
    });

    const code = createCode([ops.lambda, ["_"], [ops.scope, "message"]]);

    const fn = await evaluate.call(scope, code);
    const result = await fn.call(scope);
    assert.strictEqual(result, "Hello");
  });

  test("ops.lambda adds input parameters to scope", async () => {
    const code = createCode([
      ops.lambda,
      ["a", "b"],
      [ops.concat, [ops.scope, "b"], [ops.scope, "a"]],
    ]);
    const fn = await evaluate.call(null, code);
    const result = await fn("x", "y");
    assert.strictEqual(result, "yx");
  });

  test("ops.logicalAnd", async () => {
    assert.strictEqual(await ops.logicalAnd(true, trueFn), true);
    assert.strictEqual(await ops.logicalAnd(true, falseFn), false);
    assert.strictEqual(await ops.logicalAnd(false, trueFn), false);
    assert.strictEqual(await ops.logicalAnd(false, falseFn), false);

    assert.strictEqual(await ops.logicalAnd(true, "hi"), "hi");

    // Short-circuiting
    assert.strictEqual(await ops.logicalAnd(false, errorFn), false);
    assert.strictEqual(await ops.logicalAnd(0, true), 0);
  });

  test("ops.logicalNot", async () => {
    assert.strictEqual(await ops.logicalNot(true), false);
    assert.strictEqual(await ops.logicalNot(false), true);
    assert.strictEqual(await ops.logicalNot(0), true);
    assert.strictEqual(await ops.logicalNot(1), false);
  });

  test("ops.logicalOr", async () => {
    assert.strictEqual(await ops.logicalOr(true, trueFn), true);
    assert.strictEqual(await ops.logicalOr(true, falseFn), true);
    assert.strictEqual(await ops.logicalOr(false, trueFn), true);
    assert.strictEqual(await ops.logicalOr(false, falseFn), false);

    assert.strictEqual(await ops.logicalOr(false, "hi"), "hi");

    // Short-circuiting
    assert.strictEqual(await ops.logicalOr(true, errorFn), true);
  });

  test("ops.notEqual", async () => {
    assert.strictEqual(await ops.notEqual(1, 1), false);
    assert.strictEqual(await ops.notEqual(1, 2), true);
    assert.strictEqual(await ops.notEqual("1", 1), false);
    assert.strictEqual(await ops.notEqual("1", "1"), false);
    assert.strictEqual(await ops.notEqual(null, undefined), false);
  });

  test("ops.notStrictEqual", async () => {
    assert.strictEqual(await ops.notStrictEqual(1, 1), false);
    assert.strictEqual(await ops.notStrictEqual(1, 2), true);
    assert.strictEqual(await ops.notStrictEqual("1", 1), true);
    assert.strictEqual(await ops.notStrictEqual("1", "1"), false);
    assert.strictEqual(await ops.notStrictEqual(null, undefined), true);
  });

  test("ops.nullishCoalescing", async () => {
    assert.strictEqual(await ops.nullishCoalescing(1, falseFn), 1);
    assert.strictEqual(await ops.nullishCoalescing(null, trueFn), true);
    assert.strictEqual(await ops.nullishCoalescing(undefined, trueFn), true);

    // Short-circuiting
    assert.strictEqual(await ops.nullishCoalescing(1, errorFn), 1);
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
    assert.strictEqual(result.hello, "HELLO");
    assert.strictEqual(result.world, "WORLD");
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

  test("ops.strictEqual", async () => {
    assert.strictEqual(await ops.strictEqual(1, 1), true);
    assert.strictEqual(await ops.strictEqual(1, 2), false);
    assert.strictEqual(await ops.strictEqual("1", 1), false);
    assert.strictEqual(await ops.strictEqual("1", "1"), true);
    assert.strictEqual(await ops.strictEqual(null, undefined), false);
    assert.strictEqual(await ops.strictEqual(null, null), true);
    assert.strictEqual(await ops.strictEqual(undefined, undefined), true);
  });

  test("ops.unpack unpacks a value", async () => {
    const fixture = new String("packed");
    /** @type {any} */ (fixture).unpack = async () => "unpacked";
    const result = await ops.unpack.call(null, fixture);
    assert.strictEqual(result, "unpacked");
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

function errorFn() {
  throw new Error("This should not be called");
}

function falseFn() {
  return false;
}

function trueFn() {
  return true;
}
