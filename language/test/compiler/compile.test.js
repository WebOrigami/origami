import { Tree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import * as compile from "../../src/compiler/compile.js";
import { assertCodeEqual } from "./codeHelpers.js";

const globals = {
  concat: (...args) => args.join(""),
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
    await assertCompile("greet 'world'", "Hello, world!", { mode: "shell" });
  });

  test("function call with spread", async () => {
    await assertCompile(
      `concat("Hello", ...[", ", name], "!")`,
      "Hello, Alice!"
    );
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
      { mode: "shell" }
    );
  });

  test("merge", async () => {
    {
      const globals = {
        more: {
          b: 2,
        },
      };
      const fn = compile.expression(
        `
        {
          a: 1
          ...more
          c: a
        }
      `,
        { globals }
      );
      const result = await fn();
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
    const fn = compile.expression("{ a: { b = name }}", { globals });
    const object = await fn();
    assert.deepEqual(await object.a.b, "Alice");
  });

  test("templateDocument", async () => {
    const defineTemplateFn = compile.templateDocument(
      "Documents can contain ` backticks"
    );
    const templateFn = await defineTemplateFn();
    const value = await templateFn();
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
    const globals = {
      tag: (strings, ...values) => {
        assertCodeEqual(strings, ["Hello, ", "!"]);
        if (saved) {
          assert.deepEqual(strings, saved);
        } else {
          saved = strings;
        }
        return strings[0] + values[0] + strings[1];
      },
    };
    const program = compile.expression("(_) => tag`Hello, ${_}!`", { globals });
    const lambda = await program();
    const alice = await lambda("Alice");
    assert.equal(alice, "Hello, Alice!");
    const bob = await lambda("Bob");
    assert.equal(bob, "Hello, Bob!");
  });
});

async function assertCompile(text, expected, options = {}) {
  const mode = options.mode ?? "program";
  const parent = options.target ?? null;
  const fn = compile.expression(text, { globals, mode, parent });
  let result = await fn();
  if (Tree.isMaplike(result)) {
    result = await Tree.plain(result);
  }
  assert.deepEqual(result, expected);
}
