import { ObjectGraph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import extendTemplateFn from "../../src/framework/extendTemplateFn.js";

describe("extendTemplateFn", () => {
  test("extends scope with input", async () => {
    const scope = new ObjectGraph({
      a: 0,
      b: 1,
    });
    const fn = async function () {
      const a = await this.get("a");
      assert.equal(a, 2); // Found in input
      const b = await this.get("b");
      assert.equal(b, 1); // Found in scope
      return "result";
    };
    const template = {};
    const input = {
      a: 2, // Overwrites scope
    };
    const extendedTemplateFn = extendTemplateFn(fn, template);
    const result = await extendedTemplateFn.call(scope, input);
    assert.equal(result, "result");
  });

  test("puts input and template ambients in scope", async () => {
    const template = new ObjectGraph({});
    const input = new ObjectGraph({});
    let extendedTemplateFn;
    const fn = async function () {
      const templateValue = await this.get("@template");
      assert.equal(templateValue, template);
      const inputValue = await this.get("@input");
      assert.equal(inputValue, input);
    };
    extendedTemplateFn = extendTemplateFn(fn, template);
    await extendedTemplateFn.call(null, input);
  });

  test("a template can call itself recursively with @recurse", async () => {
    // A template function that computes the factorial of its input number.
    const fn = async function () {
      const n = await this.get("@input");
      if (n === 0) {
        return 1;
      }
      const self = await this.get("@recurse");
      const subResult = await self(n - 1);
      return n * subResult;
    };
    const extendedTemplateFn = extendTemplateFn(fn);
    const result = await extendedTemplateFn.call(null, 3);
    assert.equal(result, 6);
  });
});
