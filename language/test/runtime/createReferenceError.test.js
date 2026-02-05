import assert from "node:assert";
import { describe, test } from "node:test";
import coreGlobals from "../../src/project/coreGlobals.js";
import evaluate from "../../src/runtime/evaluate.js";

const globals = await coreGlobals();

describe("createReferenceError", () => {
  test("proposes typos using globals", async () => {
    await assertError(
      `Mat.max(1, 2)`,
      `"Mat.max" is not in scope or is undefined.
You might have meant: "Map", "Math"`,
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
      `"datu.toString" is not in scope or is undefined.
You might have meant: "data", "date"`,
    );
  });

  test("proposes typos using scope keys", async () => {
    const parent = {
      "index.ori": "Index page",
    };
    await assertError(
      `index.orj(1, 2, 3)`,
      `"index.orj" is not in scope or is undefined.
You might have meant: "index.ori"`,
      { parent },
    );
  });

  // TODO: test suggestions in arguments
});

async function assertError(source, expectedMessage, options) {
  try {
    await evaluate(source, {
      globals,
      parent: {},
      ...options,
    });
  } catch (/** @type {any} */ error) {
    assert.strictEqual(error.message, expectedMessage);
    return;
  }

  throw new Error("Expected error was not thrown");
}
