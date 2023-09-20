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
});
