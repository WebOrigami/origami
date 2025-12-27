import { evaluate, ops } from "@weborigami/language";
import assert from "node:assert";
import { describe, test } from "node:test";
import once from "../../src/origami/once.js";

describe("once", () => {
  test("evaluates a generic function only once", async () => {
    let counter = 0;
    const promise = once(() => ++counter);
    assert.strictEqual(await promise, 1);
    assert.strictEqual(await promise, 1);
  });

  test("evaluates an Origami lambda with given code only once", async () => {
    let counter = 0;
    const container = {
      increment: () => ++counter,
    };
    // Create two lambdas with the same code
    const code = [ops.lambda, 0, [], [[[ops.scope, container], "increment"]]];
    // @ts-ignore
    const lambda1 = await evaluate(code);
    const result1 = await once(lambda1);
    assert.strictEqual(result1, 1);
    // @ts-ignore
    const lambda2 = await evaluate(code);
    const result2 = await once(lambda2);
    assert.strictEqual(result2, 1);
  });
});
