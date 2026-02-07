import assert from "node:assert";
import { describe, test } from "node:test";
import coreGlobals from "../../src/project/coreGlobals.js";
import { formatError } from "../../src/runtime/errors.js";
import evaluate from "../../src/runtime/evaluate.js";

const globals = await coreGlobals();

describe("formatError", () => {
  describe("ReferenceError", () => {
    test("identifies an undefined function", async () => {
      await assertError(
        `doesntExist()`,
        `ReferenceError: Couldn't find the function or map to execute.
It looks like "doesntExist" is not in scope.
evaluating: \x1b[31mdoesntExist\x1b[0m`,
      );
    });

    test("identifies the argument that produced an error", async () => {
      await assertError(
        `Tree.map(foo, (_) => _)`,
        `ReferenceError: Tree.map: The map argument wasn't defined.
It looks like "foo" is not in scope.
evaluating: \x1b[31mfoo\x1b[0m`,
      );
    });

    test("references the Origami file that produced the error", async () => {
      await assertError(
        {
          text: `foo()`,
          name: "test.ori",
          url: "file:///path/to/test.ori",
        },
        `ReferenceError: Couldn't find the function or map to execute.
It looks like "foo" is not in scope.
evaluating: \x1b[31mfoo\x1b[0m
    at /path/to/test.ori:1:1`,
      );
    });

    test("proposes typos using globals", async () => {
      await assertError(
        `Mat.max(1, 2)`,
        `ReferenceError: Couldn't find the function or map to execute.
It looks like "Mat.max" is not in scope.
Perhaps you intended one of these: Map, Math
evaluating: \x1B[31mMat.max\x1B[0m`,
      );
    });

    test("proposes typos using inherited keys", async () => {
      await assertError(
        `
          {
            data: 1
            sub: {
              date: 2
              more: {
                result: datu.toString()
              }
            }
          }.sub.more.result
        `,
        `ReferenceError: Couldn't find the function or map to execute.
It looks like "datu.toString" is not in scope.
Perhaps you intended one of these: data, date
evaluating: \x1B[31mdatu.toString\x1B[0m
    at line 7, column 25`,
      );
    });

    test("proposes typos using scope keys", async () => {
      const parent = {
        "index.ori": "Index page",
      };
      await assertError(
        `index.orj(1, 2, 3)`,
        `ReferenceError: Couldn't find the function or map to execute.
It looks like "index.orj" is not in scope.
Perhaps you intended: index.ori
evaluating: \x1B[31mindex.orj\x1B[0m`,
        { parent },
      );
    });

    test("proposes typos using stack keys", async () => {
      await assertError(
        `((userName) => userNme.toString())("Alice")`,
        `ReferenceError: Couldn't find the function or map to execute.
It looks like "userNme.toString" is not in scope.
Perhaps you intended: userName
evaluating: \x1B[31muserNme.toString\x1B[0m`,
      );
    });

    test("suggests spaces around math operations", async () => {
      await assertError(
        `(1+2).toString()`,
        `ReferenceError: Tried to get a property of something that doesn't exist.
It looks like "1+2" is not in scope.
If you intended a math operation, Origami requires spaces around the operator: "1 + 2"
evaluating: \x1B[31m1+2\x1B[0m`,
      );
    });

    test("suggests angle brackets for global with extensions", async () => {
      // code with error: [ops.property, Performance, "ori"]
      await assertError(
        `performance.ori()`,
        `ReferenceError: Couldn't find the function or map to execute.
"performance" is a global, but "ori" looks like a file extension.
If you intended to reference a file, use angle brackets: <performance.ori>
evaluating: \x1B[31mperformance.ori\x1B[0m`,
      );
    });

    test("suggests angle brackets for property of global with extensions", async () => {
      // code with error: [ops.property, Performance, "html"]
      await assertError(
        `(performance.html).toString()`,
        `ReferenceError: Tried to get a property of something that doesn't exist.
"performance" is a global, but "html" looks like a file extension.
If you intended to reference a file, use angle brackets: <performance.html>
evaluating: \x1B[31mperformance.html\x1B[0m`,
      );
    });

    test("suggests angle brackets for accidental local key", async () => {
      // code with error: [ops.property, [[ops.inherited, 0], "posts"], ".ori"]
      await assertError(
        `{
        posts: {}
        index.html: posts.ori()
      }`,
        `ReferenceError: Couldn't find the function or map to execute.
"posts.ori" looks like a file reference, but is matching the local object property "posts".
If you intended to reference a file, use angle brackets: <posts.ori>
evaluating: \x1B[31mposts.ori\x1B[0m
    at line 3, column 21`,
      );
    });

    test("suggests angle brackets for accidental local parameter", async () => {
      // code with error: [ops.property, [[ops.inherited, 0], "posts"], ".ori"]
      await assertError(
        `((posts) => posts.ori())(1)`,
        `ReferenceError: Couldn't find the function or map to execute.
"posts.ori" looks like a file reference, but is matching the local parameter "posts".
If you intended to reference a file, use angle brackets: <posts.ori>
evaluating: \x1B[31mposts.ori\x1B[0m`,
      );
    });

    test("suggests angle brackets for property of accidental local key", async () => {
      // code with error: [ops.property, [[ops.inherited, 0], "posts"], "md"]
      await assertError(
        `{
        posts: {}
        index.html: (posts.md).toString()
      }`,
        `ReferenceError: Tried to get a property of something that doesn't exist.
"posts.md" looks like a file reference, but is matching the local object property "posts".
If you intended to reference a file, use angle brackets: <posts.md>
evaluating: \x1B[31mposts.md\x1B[0m
    at line 3, column 22`,
      );
    });

    test("handle a traversal failure inside a reference error", async () => {
      const parent = {
        post1: {
          title: "First post",
        },
      };
      await assertError(
        `(post1/totle).toUpperCase()`,
        `ReferenceError: Tried to get a property of something that doesn't exist.
This path returned undefined: post1/totle
evaluating: \x1B[31mpost1/totle\x1B[0m`,
        { parent },
      );
    });
  });

  describe("TraverseError", () => {
    test("suggest typos for failed path", async () => {
      const parent = {
        a: {
          b: {
            sub: {
              // need 2+ characters for typos
              c: 1,
            },
          },
        },
      };
      await assertError(
        `a/b/sup/c`,
        `TraverseError: A path included a null or undefined value.
The path traversal ended unexpectedly at: a/b/sup
Perhaps you intended: /sub
evaluating: \x1B[31msup/\x1B[0m`,
        { parent },
      );
    });

    test("identify when a numeric key failed", async () => {
      const parent = {
        map: new Map([[1, new Map([["a", true]])]]),
      };
      await assertError(
        `map/1/a`,
        `TraverseError: A path included a null or undefined value.
The path traversal ended unexpectedly at: map/1
Slash-separated keys are searched as strings. Here there's no string "1" key, but there is a number 1 key.
To get the value for that number key, use parentheses: map/(1)
evaluating: \x1B[31m1/\x1B[0m`,
        { parent },
      );
    });
  });
});

async function assertError(source, expectedMessage, options) {
  try {
    await evaluate(source, {
      globals,
      object: null,
      parent: {},
      stack: [],
      ...options,
    });
  } catch (/** @type {any} */ error) {
    const actualMessage = await formatError(error);
    assert.strictEqual(actualMessage, expectedMessage);
    return;
  }

  throw new Error("Expected an error to be thrown");
}
