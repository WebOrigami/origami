import { Tree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import evaluate2 from "../../src/runtime/evaluate2.js";

const globals = {
  concat: (...args) => args.join(""),
  greet: (name) => `Hello, ${name}!`,
  name: "Alice",
};

describe("evaluate2", () => {
  test("array", async () => {
    await assertEvaluation("[]", []);
    await assertEvaluation("[ 1, 2, 3, ]", [1, 2, 3]);
    await assertEvaluation("[\n'a'\n'b'\n'c'\n]", ["a", "b", "c"]);
  });

  test("functionComposition", async () => {
    await assertEvaluation("greet()", "Hello, undefined!");
    await assertEvaluation("greet(name)", "Hello, Alice!");
    await assertEvaluation("greet 'world'", "Hello, world!", { mode: "shell" });
  });

  test("function call with spread", async () => {
    await assertEvaluation(
      `concat("Hello", ...[", ", name], "!")`,
      "Hello, Alice!",
    );
  });

  test("angle bracket path", async () => {
    await assertEvaluation("<data>", "Bob", {
      parent: {
        data: "Bob",
      },
    });
  });

  test("object literal", async () => {
    await assertEvaluation("{ message = greet(name) }", {
      message: "Hello, Alice!",
    });
    await assertEvaluation(
      "{ message = greet(name) }",
      {
        message: "Hello, Alice!",
      },
      { mode: "shell" },
    );
  });

  test("object with computed property key", async () => {
    await assertEvaluation("{ [name] = greet(name) }", {
      Alice: "Hello, Alice!",
    });
  });

  test("number", async () => {
    await assertEvaluation("1", 1);
    await assertEvaluation("3.14159", 3.14159);
    await assertEvaluation("-1", -1);
  });

  test("sync object", async () => {
    await assertEvaluation("{a:1, b:2}", { a: 1, b: 2 });
    await assertEvaluation("{ a: { b: { c: 0 } } }", { a: { b: { c: 0 } } });
  });

  test("templateLiteral", async () => {
    await assertEvaluation("`Hello, ${name}!`", "Hello, Alice!");
    await assertEvaluation(
      "`escape characters with \\`backslash\\``",
      "escape characters with `backslash`",
    );
  });

  test("merge", async () => {
    {
      assertEvaluation(
        `
        {
          a: 1
          ...more
          c: a
        }
      `,
        {
          a: 1,
          b: 2,
          c: 1,
        },
        {
          globals: {
            more: {
              b: 2,
            },
          },
        },
      );
    }
  });
});

async function assertEvaluation(text, expected, options = {}) {
  let result = await evaluate2(text, {
    globals,
    ...options,
  });
  if (result instanceof Function) {
    result = await result();
  }
  if (Tree.isMaplike(result)) {
    result = await Tree.plain(result);
  }
  assert.deepEqual(result, expected);
}
