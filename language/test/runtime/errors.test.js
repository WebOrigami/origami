import assert from "node:assert";
import { describe, test } from "node:test";
import coreGlobals from "../../src/project/coreGlobals.js";
import { formatError } from "../../src/runtime/errors.js";
import evaluate from "../../src/runtime/evaluate.js";

const globals = await coreGlobals();

describe("formatError", () => {
  test("identifies an undefined function", async () => {
    await assertError(
      `doesntExist()`,
      `ReferenceError: Couldn't find the function or map to execute.
It looks like "doesntExist" is not in scope.
evaluating: \x1b[31mdoesntExist\x1b[0m
`,
    );
  });

  test("identifies the argument that produced an error", async () => {
    await assertError(
      `Tree.map(foo, (_) => _)`,
      `ReferenceError: map: The map argument wasn't defined.
It looks like "foo" is not in scope.
evaluating: \x1b[31mfoo\x1b[0m
`,
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
evaluating: \x1B[31mMat.max\x1B[0m
`,
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
evaluating: \x1B[31mindex.orj\x1B[0m
`,
      { parent },
    );
  });

  test("suggests spaces around math operations", async () => {
    await assertError(
      `(1+2).toString()`,
      `ReferenceError: Tried to get a property of something that doesn't exist.
It looks like "1+2" is not in scope.
If you intended a math operation, Origami requires spaces around the operator: "1 + 2"
evaluating: \x1B[31m(1+2).toString()\x1B[0m
`,
    );
  });
});

async function assertError(source, expectedMessage, options) {
  try {
    await evaluate(source, {
      globals,
      parent: {},
      ...options,
    });
  } catch (/** @type {any} */ error) {
    const actualMessage = await formatError(error);
    assert.strictEqual(actualMessage, expectedMessage);
    return;
  }

  throw new Error("Expected an error to be thrown");
}
