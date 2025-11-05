import assert from "node:assert";
import { describe, test } from "node:test";
import sh_handler from "../../src/handlers/sh_handler.js";

describe(".sh handler", () => {
  test("unpacks a document with Origami front matter", async () => {
    const text = `echo Hello
  echo world
  `;
    const output = await sh_handler.unpack(text);
    assert.equal(output, "Hello\nworld\n");
  });
});
