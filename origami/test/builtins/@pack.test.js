import assert from "node:assert";
import { describe, test } from "node:test";
import TextDocument from "../../src/common/TextDocument.js";

describe("@pack", () => {
  test("invokes its argument's pack() method", async () => {
    const document = new TextDocument("Hello, world!", { foo: "bar" });
    const text = await document.pack();
    assert.equal(text, "---\nfoo: bar\n---\nHello, world!");
  });
});
