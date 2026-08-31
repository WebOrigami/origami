import assert from "node:assert";
import { describe, test } from "node:test";
import manifest from "../../src/operations/manifest.js";

describe("manifest", () => {
  test("computes hashes for all paths in a maplike tree", async () => {
    const maplike = {
      "file1.txt": "Hello, world!",
      dir: {
        "file2.txt": "This is a test.",
        sub: {
          "file3.txt": "Another file.",
        },
      },
    };

    const result = await manifest(maplike);
    assert.deepStrictEqual(
      [...result.entries()],
      [
        ["file1.txt", "943a702d06f34599aee1f8da8ef9f7296031d699"],
        ["dir/file2.txt", "afa6c8b3a2fae95785dc7d9685a57835d703ac88"],
        ["dir/sub/file3.txt", "970bb9f20c46e844e228f730b8f83c9f55d5939a"],
      ],
    );
  });
});
