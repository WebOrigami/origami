import assert from "node:assert";
import * as fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import OrigamiFileMap from "../../src/runtime/OrigamiFileMap.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const tempDirectory = path.join(dirname, "fixtures/temp");

describe("OrigamiFileMap", () => {
  let tempFiles;

  beforeEach(() => {
    // Remove any existing files or directories inside the temp directory so
    // tests start from a clean slate. Use force so this is safe if the
    // directory doesn't exist.
    fs.rmSync(tempDirectory, { force: true, recursive: true });
    fs.mkdirSync(tempDirectory, { recursive: true });
    tempFiles = new OrigamiFileMap(tempDirectory);
  });

  afterEach(() => {
    // HACK: should removeEventListener, which should stop watching
    tempFiles.unwatch();
    fs.rmSync(tempDirectory, { force: true, recursive: true });
  });

  test("can watch its folder for changes", { timeout: 2000 }, async () => {
    const changedFilePath = await new Promise(async (resolve) => {
      tempFiles.addEventListener("change", (event) => {
        resolve(/** @type {any} */ (event).options.filePath);
      });
      await tempFiles.watch();
      tempFiles.set(
        "temp.txt",
        "This file is left over from testing and can be removed.",
      );
    });

    assert.equal(path.basename(changedFilePath), "temp.txt");
  });
});
