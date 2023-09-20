import { ObjectGraph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import extendTemplateFn from "../../src/framework/extendTemplateFn.js";

describe("extendTemplateFn", () => {
  test("puts input and template in scope", async () => {
    const fn = async function () {
      const a = await this.get("a");
      const b = await this.get("b");
      return { a, b };
    };
    const template = {
      a: 0,
      b: 0,
    };
    const input = {
      a: 1, // This value will be preferred over template's
    };
    const extendedTemplateFn = extendTemplateFn(fn, template);
    const result = await extendedTemplateFn(input);
    assert.deepEqual(result, {
      a: 1,
      b: 0,
    });
  });

  test("puts ambients in scope", async () => {
    const template = new ObjectGraph({});
    const input = new ObjectGraph({});
    const fn = async function () {
      const templateValue = await this.get("@template");
      assert.equal(templateValue, template);
      const fnValue = await this.get("@recurse");
      assert.equal(fnValue, fn);
      const inputValue = await this.get("@input");
      assert.equal(inputValue, input);
    };
    const extendedTemplateFn = extendTemplateFn(fn, template);
    await extendedTemplateFn(input);
  });
});
