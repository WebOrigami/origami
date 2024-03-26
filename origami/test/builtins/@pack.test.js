import { symbols } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import documentObject from "../../src/common/documentObject.js";

describe("@pack", () => {
  test("invokes its argument's pack() method", async () => {
    const document = documentObject("Hello, world!", {
      foo: "bar",
    });
    // @ts-ignore
    const text = await document[symbols.pack]();
    assert.equal(text, "---\nfoo: bar\n---\nHello, world!");
  });
});
