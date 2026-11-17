import assert from "node:assert";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import files from "../../src/protocols/files.js";
import OrigamiFileMap from "../../src/runtime/OrigamiFileMap.js";
import executionContext from "../../src/runtime/executionContext.js";

// Get the fixture directory path relative to this module
const fixturePath = path.join(fileURLToPath(import.meta.url), "..", "fixtures");
const fixtures = new OrigamiFileMap(fixturePath);
await fixtures.initializeGlobals();

// Construct a sufficient execution context for files:
const context = { parent: fixtures };

describe("files: protocol", () => {
  test("returns an existing file", async () => {
    const buffer = await executionContext.run(context, async () =>
      files("folder/", "sub/", "data.json"),
    );
    let text = new TextDecoder().decode(buffer);
    // Normalize line endings to handle Windows
    text = text.replace(/\r\n/g, "\n");
    assert.strictEqual(text, '{\n  "message": "Hello"\n}\n');
  });

  test("can traverse into an unpackable file", async () => {
    const message = await executionContext.run(context, async () =>
      files("folder/", "sub/", "data.json/", "message"),
    );
    assert.strictEqual(message, "Hello");
  });

  test("returns undefined for a non-existing file", async () => {
    const buffer = await executionContext.run(context, async () =>
      files("folder/", "sub/", "non-existing.txt"),
    );
    assert.strictEqual(buffer, undefined);
  });

  test("throws an error if an intermediate folder does not exist", async () => {
    await assert.rejects(
      async () =>
        await executionContext.run(context, async () =>
          files("folder/", "non-existing/", "data.json"),
        ),
      {
        name: "ReferenceError",
      },
    );
  });

  test("returns an existing folder", async () => {
    const map = await executionContext.run(context, async () =>
      files("folder/", "sub/"),
    );
    assert(map instanceof OrigamiFileMap);
  });

  test("returns a Map for a non-existent path as long as last key ends in a trailing slash", async () => {
    const map = await executionContext.run(context, async () =>
      files("folder/", "non-existing/", "sub/"),
    );
    assert(map instanceof OrigamiFileMap);
  });
});
