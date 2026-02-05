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
      `ReferenceError: doesntExist is not defined
evaluating: \x1b[31mdoesntExist()\x1b[0m
`,
    );
  });

  test("identifies the argument that produced an error", async () => {
    await assertError(
      `Tree.map(foo, (_) => _)`,
      `TypeError: map: The tree argument wasn't defined.
evaluating: \x1b[31mfoo\x1b[0m
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
    const actualMessage = formatError(error);
    assert.strictEqual(actualMessage, expectedMessage);
  }
}
