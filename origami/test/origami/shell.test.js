import assert from "node:assert";
import { describe, test } from "node:test";
import shell from "../../src/origami/shell.js";

describe("shell", () => {
  test("returns the output of running a shell command", async () => {
    const result = await shell("echo hello");
    assert(result);
    assert.strictEqual(result.trim(), "hello");
  });
});
