import assert from "node:assert";
import { describe, test } from "node:test";
import sh_handler from "../../src/handlers/sh_handler.js";

describe(".sh handler", () => {
  test("invokes shell commands", async () => {
    const text = `echo Hello
  cat
  `;
    const fn = await sh_handler.unpack(text);
    const output = await fn("Input text");
    assert.equal(output, "Hello\nInput text");
  });
});
