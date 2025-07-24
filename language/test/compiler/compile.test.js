import { ObjectTree, Tree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import * as compile from "../../src/compiler/compile.js";
import { assertCodeEqual } from "./codeHelpers.js";

const sharedGlobals = {
  greet: (name) => `Hello, ${name}!`,
  name: "Alice",
};

describe("compile", () => {
  test("array", async () => {
    await assertCompile("[]", []);
    await assertCompile("[ 1, 2, 3, ]", [1, 2, 3]);
    await assertCompile("[\n'a'\n'b'\n'c'\n]", ["a", "b", "c"]);
  });

  test("functionComposition", async () => {
    await assertCompile("greet()", "Hello, undefined!");
    await assertCompile("greet(name)", "Hello, Alice!");
    await assertCompile("greet(name)", "Hello, Alice!", { mode: "jse" });
    await assertCompile("greet 'world'", "Hello, world!");
  });

  test("angle bracket path", async () => {
    await assertCompile("<data>", "Bob", {
      target: {
        data: "Bob",
      },
    });
  });

  test("object literal", async () => {
    await assertCompile("{ message = greet(name) }", {
      message: "Hello, Alice!",
    });
    await assertCompile(
      "{ message = greet(name) }",
      {
        message: "Hello, Alice!",
      },
      { mode: "jse" }
    );
  });

  test.skip("merge", async () => {
    {
      const scope = new ObjectTree({
        more: {
          b: 2,
        },
      });
      const fn = compile.expression(`
        {
          a: 1
          ...more
          c: a
        }
      `);
      const result = await fn.call(scope);
      assert.deepEqual(await Tree.plain(result), {
        a: 1,
        b: 2,
        c: 1,
      });
    }
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
    const fn = compile.expression("{ a: { b = name }}", {
      globals: sharedGlobals,
    });
    const object = await fn.call(null);
    assert.deepEqual(await object.a.b, "Alice");
  });

  test("templateDocument", async () => {
    const defineTemplateFn = compile.templateDocument(
      "Documents can contain ` backticks"
    );
    const templateFn = await defineTemplateFn.call(null);
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

  test.only("tagged template string array is identical across calls", async () => {
    let saved;
    const globals = {
      tag: (strings, ...values) => {
        assertCodeEqual(strings, ["Hello, ", "!"]);
        if (saved) {
          assert.equal(strings, saved);
        } else {
          saved = strings;
        }
        return strings[0] + values[0] + strings[1];
      },
    };
    const program = compile.expression("=tag`Hello, ${_}!`", { globals });
    const lambda = await program.call(null);
    const alice = await lambda("Alice");
    assert.equal(alice, "Hello, Alice!");
    const bob = await lambda("Bob");
    assert.equal(bob, "Hello, Bob!");
  });
});

async function assertCompile(text, expected, options = {}) {
  const mode = options.mode ?? "shell";
  const fn = compile.expression(text, { globals: sharedGlobals, mode });
  const target = options.target ?? null;
  let result = await fn.call(target);
  if (Tree.isTreelike(result)) {
    result = await Tree.plain(result);
  }
  assert.deepEqual(result, expected);
}
