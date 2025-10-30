import assert from "node:assert";
import * as fs from "node:fs";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import OrigamiFileMap from "../../src/runtime/OrigamiFileMap.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const tempDirectory = path.join(dirname, "fixtures/temp/OrigamiFileMap");

describe("OrigamiFileMap", () => {
  test.skip("can watch its folder for changes", { timeout: 2000 }, async () => {
    createTempDirectory();

    const tempFiles = new OrigamiFileMap(tempDirectory);
    const changedFileName = await new Promise(async (resolve) => {
      tempFiles.addEventListener("change", (event) => {
        resolve(/** @type {any} */ (event).options.key);
      });
      tempFiles.set(
        "foo.txt",
        "This file is left over from testing and can be removed."
      );
    });
    removeTempDirectory();
    assert.equal(changedFileName, "foo.txt");
  });
});

function createTempDirectory() {
  // Remove any existing files or directories inside the temp directory so
  // tests start from a clean slate. Use force so this is safe if the
  // directory doesn't exist.
  fs.rmSync(tempDirectory, { force: true, recursive: true });
  fs.mkdirSync(tempDirectory, { recursive: true });
}

function removeTempDirectory() {
  fs.rmSync(tempDirectory, { force: true, recursive: true });
}
