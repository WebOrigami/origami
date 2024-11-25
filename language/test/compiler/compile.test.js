import { ObjectTree, symbols, Tree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import * as compile from "../../src/compiler/compile.js";
import { ops } from "../../src/runtime/internal.js";
import { stripCodeLocations } from "./stripCodeLocations.js";

const shared = new ObjectTree({
  greet: (name) => `Hello, ${name}!`,
  name: "Alice",
});

describe("compile", () => {
  test("array", async () => {
    await assertCompile("[]", []);
    await assertCompile("[ 1, 2, 3, ]", [1, 2, 3]);
    await assertCompile("[\n'a'\n'b'\n'c'\n]", ["a", "b", "c"]);
  });

  test("functionComposition", async () => {
    await assertCompile("greet()", "Hello, undefined!");
    await assertCompile("greet(name)", "Hello, Alice!");
    await assertCompile("greet 'world'", "Hello, world!");
  });

  test("tree", async () => {
    const fn = compile.expression("{ message = greet(name) }");
    const tree = await fn.call(null);
    tree[symbols.parent] = shared;
    assert.deepEqual(await Tree.plain(tree), {
      message: "Hello, Alice!",
    });
  });

  test("number", async () => {
    await assertCompile("1", 1);
    await assertCompile("3.14159", 3.14159);
    await assertCompile("-1", -1);
  });

  test("sync object", async () => {
    await assertCompile("{a:1, b:2}", { a: 1, b: 2 });
    await assertCompile("{ a: { b: { c: 0 } } }", { a: { b: { c: 0 } } });
  });

  test("async object", async () => {
    const fn = compile.expression("{ a: { b = name }}");
    const object = await fn.call(shared);
    assert.deepEqual(await object["a/"].b, "Alice");
  });

  test("templateDocument", async () => {
    const fn = compile.templateDocument("Documents can contain ` backticks");
    const templateFn = await fn.call(shared);
    const value = await templateFn.call(null);
    assert.deepEqual(value, "Documents can contain ` backticks");
  });

  test("templateLiteral", async () => {
    await assertCompile("`Hello, ${name}!`", "Hello, Alice!");
    await assertCompile(
      "`escape characters with \\`backslash\\``",
      "escape characters with `backslash`"
    );
  });

  test("tagged template string array is identical across calls", async () => {
    let saved;
    const scope = new ObjectTree({
      tag: (strings, ...values) => {
        assert.deepEqual(strings, ["Hello, ", "!"]);
        if (saved) {
          assert.equal(strings, saved);
        } else {
          saved = strings;
        }
        return strings[0] + values[0] + strings[1];
      },
    });
    const program = compile.expression("=tag`Hello, ${_}!`");
    const lambda = await program.call(scope);
    const alice = await lambda("Alice");
    assert.equal(alice, "Hello, Alice!");
    const bob = await lambda("Bob");
    assert.equal(bob, "Hello, Bob!");
  });

  test("converts non-local ops.scope calls to ops.cache", async () => {
    const expression = `
      (name) => {
        a: 1
        b: a            // local, should be left as ops.scope
        c: nonLocal     // non-local, should be converted to ops.cache
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
        ["c", [ops.external, "nonLocal", {}]],
        ["d", [ops.scope, "name"]],
      ],
    ]);
  });
});

async function assertCompile(text, expected) {
  const fn = compile.expression(text);
  const result = await fn.call(shared);
  assert.deepEqual(result, expected);
}
