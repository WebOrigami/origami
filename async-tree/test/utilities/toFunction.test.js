import assert from "node:assert";
import { describe, test } from "node:test";
import ObjectTree from "../../src/drivers/ObjectTree.js";
import toFunction from "../../src/utilities/toFunction.js";

describe("toFunction", () => {
  test("returns a plain function as is", () => {
    const fn = () => {};
    assert.equal(toFunction(fn), fn);
  });

  test("returns a tree's getter as a function", async () => {
    const tree = new ObjectTree({
      a: 1,
    });
    const fn = toFunction(tree);
    // @ts-ignore
    assert.equal(await fn("a"), 1);
  });

  test("can use a packed object's `unpack` as a function", async () => {
    const obj = new String();
    /** @type {any} */ (obj).unpack = () => () => "result";
    const fn = toFunction(obj);
    // @ts-ignore
    assert.equal(await fn(), "result");
  });

  test("returns null for something that's not a function", () => {
    // @ts-ignore
    const result = toFunction("this is not a function");
    assert.equal(result, null);
  });
});
