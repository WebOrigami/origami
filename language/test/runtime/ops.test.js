import { DeepObjectTree, ObjectTree, Tree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";

import { evaluate, ops } from "../../src/runtime/internal.js";
import { createCode } from "../compiler/codeHelpers.js";

describe("ops", () => {
  test("ops.addition adds two numbers", async () => {
    assert.strictEqual(ops.addition(2, 2), 4);
    assert.strictEqual(ops.addition(2, true), 3);
  });

  test("ops.addition concatenates two strings", async () => {
    assert.strictEqual(ops.addition("hello ", "everyone"), "hello everyone");
    assert.strictEqual(
      ops.addition("2001", ": A Space Odyssey"),
      "2001: A Space Odyssey"
    );
  });

  test("ops.array creates an array", async () => {
    const code = createCode([ops.array, 1, 2, 3]);
    const result = await evaluate.call(null, code);
    assert.deepEqual(result, [1, 2, 3]);
  });

  test("ops.bitwiseAnd", () => {
    assert.strictEqual(ops.bitwiseAnd(5, 3), 1);
  });

  test("ops.bitwiseNot", () => {
    assert.strictEqual(ops.bitwiseNot(5), -6);
    assert.strictEqual(ops.bitwiseNot(-3), 2);
  });

  test("ops.bitwiseOr", () => {
    assert.strictEqual(ops.bitwiseOr(5, 3), 7);
  });

  test("ops.bitwiseXor", () => {
    assert.strictEqual(ops.bitwiseXor(5, 3), 6);
  });

  test("ops.comma returns the last value", async () => {
    const code = createCode([ops.comma, 1, 2, 3]);
    const result = await evaluate.call(null, code);
    assert.strictEqual(result, 3);
  });

  test("ops.concat concatenates tree value text", async () => {
    const container = {
      name: "world",
    };
    const code = createCode([
      ops.concat,
      "Hello, ",
      [[ops.scope, container], "name"],
      ".",
    ]);

    const result = await evaluate.call(null, code);
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

  test("ops.construct", async () => {
    assert.equal(await ops.construct(String, "hello"), "hello");
  });

  test("ops.context", async () => {
    const tree = new DeepObjectTree({
      a: {
        b: {
          c: {},
        },
      },
    });
    const b = await Tree.traverse(tree, "a", "b");
    const c = await b.get("c");
    assert.equal(ops.context.call(c), c);
    assert.equal(ops.context.call(c, 1), b);
  });

  test("ops.division divides two numbers", async () => {
    assert.strictEqual(ops.division(12, 2), 6);
    assert.strictEqual(ops.division(3, 2), 1.5);
    assert.strictEqual(ops.division(6, "3"), 2);
    assert.strictEqual(ops.division(2, 0), Infinity);
  });

  test("ops.equal", () => {
    assert(ops.equal(1, 1));
    assert(!ops.equal(1, 2));
    assert(ops.equal("1", 1));
    assert(ops.equal("1", "1"));
    assert(ops.equal(null, undefined));
  });

  test("ops.exponentiation", () => {
    assert.strictEqual(ops.exponentiation(2, 3), 8);
    assert.strictEqual(ops.exponentiation(2, 0), 1);
  });

  test("ops.cache evaluates code and cache its result", async () => {
    let count = 0;
    const container = {
      group: {
        get count() {
          // Use promise to test async behavior
          return Promise.resolve(++count);
        },
      },
    };
    const code = createCode([
      ops.cache,
      {},
      "group/count",
      [
        [ops.scope, container],
        [ops.literal, "group"],
        [ops.literal, "count"],
      ],
    ]);
    const result = await evaluate.call(null, code);
    assert.strictEqual(result, 1);
    const result2 = await evaluate.call(null, code);
    assert.strictEqual(result2, 1);
  });

  describe("ops.flat", () => {
    test("flattens arrays", async () => {
      assert.deepEqual(await ops.flat(1, 2, [3]), [1, 2, 3]);
    });

    test("flattens treelike objects", async () => {
      const object = {
        a: 1,
        b: 2,
      };
      const tree = new ObjectTree({
        c: 3,
        d: 4,
      });
      const array = [5, 6];
      const result = await ops.flat(object, tree, array);
      assert.deepEqual(result, [1, 2, 3, 4, 5, 6]);
    });
  });

  test("ops.greaterThan", () => {
    assert(ops.greaterThan(5, 3));
    assert(!ops.greaterThan(3, 3));
    assert(ops.greaterThan("ab", "aa"));
  });

  test("ops.greaterThanOrEqual", () => {
    assert(ops.greaterThanOrEqual(5, 3));
    assert(ops.greaterThanOrEqual(3, 3));
    assert(ops.greaterThanOrEqual("ab", "aa"));
  });

  test("ops.lambda defines a function with no inputs", async () => {
    const code = createCode([ops.lambda, [], [ops.literal, "result"]]);
    const fn = await evaluate.call(null, code);
    const result = await fn.call();
    assert.strictEqual(result, "result");
  });

  test("ops.lambda defines a function with underscore input", async () => {
    const container = {
      message: "Hello",
    };

    const code = createCode([
      ops.lambda,
      ["_"],
      [[ops.scope, container], "message"],
    ]);

    const fn = await evaluate.call(null, code);
    const result = await fn();
    assert.strictEqual(result, "Hello");
  });

  test("ops.lambda adds input parameters to scope", async () => {
    const code = createCode([
      ops.lambda,
      [
        [ops.literal, "a"],
        [ops.literal, "b"],
      ],
      [ops.concat, [[ops.context], "b"], [[ops.context], "a"]],
    ]);
    const fn = await evaluate.call(null, code);
    const result = await fn("x", "y");
    assert.strictEqual(result, "yx");
  });

  test("ops.lessThan", () => {
    assert(!ops.lessThan(5, 3));
    assert(!ops.lessThan(3, 3));
    assert(ops.lessThan("aa", "ab"));
  });

  test("ops.lessThanOrEqual", () => {
    assert(!ops.lessThanOrEqual(5, 3));
    assert(ops.lessThanOrEqual(3, 3));
    assert(ops.lessThanOrEqual("aa", "ab"));
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

  test("ops.merge", async () => {
    // {
    //   a: 1
    //   ...more
    //   c: a
    // }
    const container = {
      more: { b: 2 },
    };
    const code = createCode([
      [
        ops.object,
        ["a", [ops.literal, 1]],
        ["c", [[ops.context], "a"]],
        [
          "_result",
          [
            ops.merge,
            [ops.object, ["a", [ops.getter, [[ops.context, 1], "a"]]]],
            [[ops.scope, container], "more"],
            [ops.object, ["c", [ops.getter, [[ops.context, 1], "c"]]]],
          ],
        ],
      ],
      "_result",
    ]);
    const result = await evaluate.call(null, code);
    assert.deepEqual(await Tree.plain(result), { a: 1, b: 2, c: 1 });
  });

  test("ops.multiplication multiplies two numbers", async () => {
    assert.strictEqual(ops.multiplication(3, 4), 12);
    assert.strictEqual(ops.multiplication(-3, 4), -12);
    assert.strictEqual(ops.multiplication("3", 2), 6);
    assert.strictEqual(ops.multiplication("foo", 2), NaN);
  });

  // test("ops.optionalTraverse", async () => {
  //   assert.equal(await ops.optionalTraverse(null, "a"), undefined);
  //   assert.equal(await ops.optionalTraverse({ a: 1 }, "a"), 1);
  // });

  test("ops.notEqual", () => {
    assert(!ops.notEqual(1, 1));
    assert(ops.notEqual(1, 2));
    assert(!ops.notEqual("1", 1));
    assert(!ops.notEqual("1", "1"));
    assert(!ops.notEqual(null, undefined));
  });

  test("ops.notStrictEqual", () => {
    assert(!ops.notStrictEqual(1, 1));
    assert(ops.notStrictEqual(1, 2));
    assert(ops.notStrictEqual("1", 1));
    assert(!ops.notStrictEqual("1", "1"));
    assert(ops.notStrictEqual(null, undefined));
  });

  test("ops.nullishCoalescing", async () => {
    assert.strictEqual(await ops.nullishCoalescing(1, falseFn), 1);
    assert.strictEqual(await ops.nullishCoalescing(null, trueFn), true);
    assert.strictEqual(await ops.nullishCoalescing(undefined, trueFn), true);

    // Short-circuiting
    assert.strictEqual(await ops.nullishCoalescing(1, errorFn), 1);
  });

  test("ops.object instantiates an object", async () => {
    const container = {
      upper: (s) => s.toUpperCase(),
    };

    const code = createCode([
      ops.object,
      ["hello", [[[ops.scope, container], "upper"], "hello"]],
      ["world", [[[ops.scope, container], "upper"], "world"]],
    ]);

    const result = await evaluate.call(null, code);
    assert.strictEqual(result.hello, "HELLO");
    assert.strictEqual(result.world, "WORLD");
  });

  test("ops.object instantiates an array", async () => {
    const container = {
      upper: (s) => s.toUpperCase(),
    };
    const code = createCode([
      ops.array,
      "Hello",
      1,
      [[[ops.scope, container], "upper"], "world"],
    ]);
    const result = await evaluate.call(null, code);
    assert.deepEqual(result, ["Hello", 1, "WORLD"]);
  });

  test("ops.property returns a property if defined, otherwise traverses", async () => {
    assert.equal(await ops.property({ a: 1 }, "a"), 1);
    assert.equal(await ops.property({ a: 1 }, "b"), undefined);
    const uppercase = (text) => text.toUpperCase();
    assert.equal(await ops.property(uppercase, "a"), "A");
  });

  test("ops.remainder calculates the remainder of two numbers", async () => {
    assert.strictEqual(ops.remainder(13, 5), 3);
    assert.strictEqual(ops.remainder(-13, 5), -3);
    assert.strictEqual(ops.remainder(4, 2), 0);
    assert.strictEqual(ops.remainder(-4, 2), -0);
  });

  describe("ops.scope", () => {
    test("returns the scope of the given tree", async () => {
      const tree = new DeepObjectTree({
        a: {
          b: {},
        },
        c: 1,
      });
      const a = await tree.get("a");
      const b = await a.get("b");
      const scope = await ops.scope(b);
      assert.equal(await scope?.get("c"), 1);
    });
  });

  test("ops.shiftLeft", () => {
    assert.strictEqual(ops.shiftLeft(5, 2), 20);
  });

  test("ops.shiftRightSigned", () => {
    assert.strictEqual(ops.shiftRightSigned(20, 2), 5);
    assert.strictEqual(ops.shiftRightSigned(-20, 2), -5);
  });

  test("ops.shiftRightUnsigned", () => {
    assert.strictEqual(ops.shiftRightUnsigned(20, 2), 5);
    assert.strictEqual(ops.shiftRightUnsigned(-5, 2), 1073741822);
  });

  test("ops.strictEqual", () => {
    assert(ops.strictEqual(1, 1));
    assert(!ops.strictEqual(1, 2));
    assert(!ops.strictEqual("1", 1));
    assert(ops.strictEqual("1", "1"));
    assert(!ops.strictEqual(null, undefined));
    assert(ops.strictEqual(null, null));
    assert(ops.strictEqual(undefined, undefined));
  });

  test("ops.subtraction subtracts two numbers", async () => {
    assert.strictEqual(ops.subtraction(5, 3), 2);
    assert.strictEqual(ops.subtraction(3.5, 5), -1.5);
    assert.strictEqual(ops.subtraction(5, "hello"), NaN);
    assert.strictEqual(ops.subtraction(5, true), 4);
  });

  test("ops.typeOf emulates JavaScript typeof", () => {
    assert.strictEqual(ops.typeOf(true), "boolean");
    assert.strictEqual(ops.typeOf(1), "number");
    assert.strictEqual(ops.typeOf("hi"), "string");
    assert.strictEqual(ops.typeOf(undefined), "undefined");
    assert.strictEqual(
      ops.typeOf(() => null),
      "function"
    );
  });

  test("ops.unaryMinus", () => {
    assert.strictEqual(ops.unaryMinus(4), -4);
    assert.strictEqual(ops.unaryMinus(-4), 4);
  });

  test("ops.unaryPlus", () => {
    assert.strictEqual(ops.unaryPlus(1), 1);
    assert.strictEqual(ops.unaryPlus(-1), -1);
    assert.strictEqual(ops.unaryPlus(""), 0);
  });

  test("ops.unpack unpacks a value", async () => {
    const fixture = new String("packed");
    /** @type {any} */ (fixture).unpack = async () => "unpacked";
    const result = await ops.unpack.call(null, fixture);
    assert.strictEqual(result, "unpacked");
  });

  test("ops.voidOp returns undefined", () => {
    assert.strictEqual(ops.voidOp(123), undefined);
    assert.strictEqual(ops.voidOp("hello"), undefined);
    assert.strictEqual(ops.voidOp(null), undefined);
  });
});

function errorFn() {
  throw new Error("This should not be called");
}

function falseFn() {
  return false;
}

function trueFn() {
  return true;
}
