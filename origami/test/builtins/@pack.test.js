import assert from "node:assert";
import { describe, test } from "node:test";
import textDocument2 from "../../src/common/textDocument2.js";

describe("@pack", () => {
  test("invokes its argument's pack() method", async () => {
    const document = textDocument2("Hello, world!", { foo: "bar" });
    const text = await document.pack();
    assert.equal(text, "---\nfoo: bar\n---\nHello, world!");
  });
});
