import assert from "node:assert";
import { describe, test } from "node:test";

import evaluate from "../../src/runtime/evaluate.js";
import { createCode } from "../compiler/codeHelpers.js";

describe("evaluate", () => {
  test("if object in function position isn't a function, can unpack it", async () => {
    const fn = (...args) => args.join(",");
    const packed = new String();
    /** @type {any} */ (packed).unpack = async () => fn;
    const code = createCode([packed, "a", "b", "c"]);
    const result = await evaluate(code);
    assert.equal(result, "a,b,c");
  });
});
