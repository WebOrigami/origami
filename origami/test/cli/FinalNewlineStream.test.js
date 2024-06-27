import assert from "node:assert";
import { describe, test } from "node:test";
import FinalNewlineStream from "../../src/cli/FinalNewlineStream.js";

describe("FinalNewlineStream", () => {
  test("adds a newline to a stream that doesn't end with one", async () => {
    const originalStream = ReadableStream.from(["text without newline"]);
    const finalNewlineStream = new FinalNewlineStream();
    const stream = originalStream.pipeThrough(finalNewlineStream);
    const text = await readStream(stream);
    assert.equal(text, "text without newline\n");
  });

  test("doesn't add a newline to a stream that ends with one", async () => {
    const originalStream = ReadableStream.from(["text with newline\n"]);
    const finalNewlineStream = new FinalNewlineStream();
    const stream = originalStream.pipeThrough(finalNewlineStream);
    const text = await readStream(stream);
    assert.equal(text, "text with newline\n");
  });
});

async function readStream(stream) {
  let result = "";
  for await (const chunk of stream) {
    result += chunk;
  }
  return result;
}
