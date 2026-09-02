import assert from "node:assert";
import { describe, test } from "node:test";
import ObjectMap from "../../src/drivers/ObjectMap.js";
import plain from "../../src/operations/plain.js";
import syncManifest from "../../src/utilities/syncManifest.js";

describe("syncManifest", () => {
  test("computes hashes for all paths in a maplike tree", async () => {
    const maplike = new ObjectMap(
      {
        "file1.txt": "Hello, world!",
        dir: {
          "file2.txt": "This is a test.",
          sub: {
            "file3.txt": "Another file.",
          },
        },
      },
      { deep: true },
    );

    const result = syncManifest(maplike);
    assert.deepStrictEqual(await plain(result), {
      "file1.txt": "943a702d06f34599aee1f8da8ef9f7296031d699",
      dir: {
        "file2.txt": "afa6c8b3a2fae95785dc7d9685a57835d703ac88",
        sub: {
          "file3.txt": "970bb9f20c46e844e228f730b8f83c9f55d5939a",
        },
      },
    });
  });

  test("defers to subtree manifest() if defined", async () => {
    const subtree = {
      manifest() {
        return "subtree manifest";
      },
    };
    const tree = new ObjectMap({
      subtree,
    });

    const result = syncManifest(tree);
    assert.deepStrictEqual(await plain(result), {
      subtree: "subtree manifest",
    });
  });
});
