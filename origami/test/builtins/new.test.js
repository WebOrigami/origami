import { ObjectTree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import instantiate from "../../src/builtins/new.js";

describe("new:", () => {
  test("finds class in scope and returns a constructor", async () => {
    const scope = new ObjectTree({
      "js:": {
        Number: Number,
      },
    });
    const fn = await instantiate.call(scope, "js:", "Number");
    const number = fn("1");
    assert(number instanceof Number);
    assert.equal(number, 1);
  });

  test("can accept a class and returns a constructor", async () => {
    const fn = await instantiate.call(null, Number);
    const number = fn("1");
    assert.equal(number, 1);
  });
});
