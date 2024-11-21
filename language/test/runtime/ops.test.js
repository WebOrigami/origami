import { ObjectTree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";

import { evaluate, ops } from "../../src/runtime/internal.js";

describe.only("ops", () => {
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
    assert.equal(result, 1);
  });

  test("ops.cache looks up a value in scope and memoizes it", async () => {
    let count = 0;
    const tree = new ObjectTree({
      get count() {
        return ++count;
      },
    });
    const code = createCode([ops.cache, "count", {}]);
    const result = await evaluate.call(tree, code);
    assert.equal(result, 1);
    const result2 = await evaluate.call(tree, code);
    assert.equal(result2, 1);
  });

  test("ops.concat concatenates tree value text", async () => {
    const scope = new ObjectTree({
      name: "world",
    });

    const code = createCode([ops.concat, "Hello, ", [ops.scope, "name"], "."]);

    const result = await evaluate.call(scope, code);
    assert.equal(result, "Hello, world.");
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

    const code = createCode([ops.lambda, ["_"], [ops.scope, "message"]]);

    const fn = await evaluate.call(scope, code);
    const result = await fn.call(scope);
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

  test("ops.unpack unpacks a value", async () => {
    const fixture = new String("packed");
    /** @type {any} */ (fixture).unpack = async () => "unpacked";
    const result = await ops.unpack.call(null, fixture);
    assert.equal(result, "unpacked");
  });

  describe.only("calc", async () => {
    test("ops.conditional", async () => {
      assert.equal(await ops.conditional(true, trueFn, falseFn), true);
      assert.equal(await ops.conditional(true, falseFn, trueFn), false);
      assert.equal(await ops.conditional(false, trueFn, falseFn), false);
      assert.equal(await ops.conditional(false, falseFn, trueFn), true);

      // Short-circuiting
      assert.equal(await ops.conditional(false, errorFn, trueFn), true);
    });

    test("ops.equal", async () => {
      assert.equal(await ops.equal(1, 1), true);
      assert.equal(await ops.equal(1, 2), false);
      assert.equal(await ops.equal("1", 1), true);
      assert.equal(await ops.equal("1", "1"), true);
      assert.equal(await ops.equal(null, undefined), true);
    });

    test("ops.notEqual", async () => {
      assert.equal(await ops.notEqual(1, 1), false);
      assert.equal(await ops.notEqual(1, 2), true);
      assert.equal(await ops.notEqual("1", 1), false);
      assert.equal(await ops.notEqual("1", "1"), false);
      assert.equal(await ops.notEqual(null, undefined), false);
    });

    test("ops.notStrictEqual", async () => {
      assert.equal(await ops.notStrictEqual(1, 1), false);
      assert.equal(await ops.notStrictEqual(1, 2), true);
      assert.equal(await ops.notStrictEqual("1", 1), true);
      assert.equal(await ops.notStrictEqual("1", "1"), false);
      assert.equal(await ops.notStrictEqual(null, undefined), true);
    });

    test("ops.strictEqual", async () => {
      assert.equal(await ops.strictEqual(1, 1), true);
      assert.equal(await ops.strictEqual(1, 2), false);
      assert.equal(await ops.strictEqual("1", 1), false);
      assert.equal(await ops.strictEqual("1", "1"), true);
      assert.equal(await ops.strictEqual(null, undefined), false);
      assert.equal(await ops.strictEqual(null, null), true);
      assert.equal(await ops.strictEqual(undefined, undefined), true);
    });

    test("ops.logicalAnd", async () => {
      assert.equal(await ops.logicalAnd(true, trueFn), true);
      assert.equal(await ops.logicalAnd(true, falseFn), false);
      assert.equal(await ops.logicalAnd(false, trueFn), false);
      assert.equal(await ops.logicalAnd(false, falseFn), false);

      // Short-circuiting
      assert.equal(await ops.logicalAnd(false, errorFn), false);
    });

    test("ops.logicalOr", async () => {
      assert.equal(await ops.logicalOr(true, trueFn), true);
      assert.equal(await ops.logicalOr(true, falseFn), true);
      assert.equal(await ops.logicalOr(false, trueFn), true);
      assert.equal(await ops.logicalOr(false, falseFn), false);

      // Short-circuiting
      assert.equal(await ops.logicalOr(true, errorFn), true);
    });

    test("ops.nullishCoalescing", async () => {
      assert.equal(await ops.nullishCoalescing(1, falseFn), 1);
      assert.equal(await ops.nullishCoalescing(null, trueFn), true);
      assert.equal(await ops.nullishCoalescing(undefined, trueFn), true);

      // Short-circuiting
      assert.equal(await ops.nullishCoalescing(1, errorFn), 1);
    });
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
