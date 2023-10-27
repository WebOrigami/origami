import assert from "node:assert";
import * as fs from "node:fs/promises";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import OrigamiFiles from "../../src/runtime/OrigamiFiles.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const tempDirectory = path.join(dirname, "fixtures/temp");

describe("OrigamiFiles", () => {
  test("can watch its folder for changes", { timeout: 2000 }, async () => {
    await createTempDirectory();
    const tempFiles = new OrigamiFiles(tempDirectory);
    const changedFileName = await new Promise(async (resolve) => {
      // @ts-ignore
      tempFiles.addEventListener("change", (event) => {
        resolve(/** @type {any} */ (event).options.key);
      });
      // @ts-ignore
      await tempFiles.set(
        "foo.txt",
        "This file is left over from testing and can be removed."
      );
    });
    await removeTempDirectory();
    assert.equal(changedFileName, "foo.txt");
  });
});

async function createTempDirectory() {
  await fs.mkdir(tempDirectory, { recursive: true });
}

async function removeTempDirectory() {
  await fs.rm(tempDirectory, { recursive: true });
}
