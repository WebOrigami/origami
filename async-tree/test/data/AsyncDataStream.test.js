import assert from "node:assert";
import { describe, test } from "node:test";
import AsyncDataStream from "../../src/data/AsyncDataStream.js";

describe("AsyncDataStream", () => {
  test("returns a stream in the Response formats", async () => {
    // Create a stream with "Hello"
    const stream = ReadableStream.from(["Hello"]);
    const data = new AsyncDataStream(stream);
    assert.equal(data.body, stream);
    assert.deepEqual(
      await data.bytes(),
      new Uint8Array([72, 101, 108, 108, 111])
    );
    assert.equal(await data.text(), "Hello");
  });
});
