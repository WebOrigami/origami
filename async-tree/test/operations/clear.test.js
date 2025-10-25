import assert from "node:assert";
import * as fs from "node:fs/promises";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import FileTree from "../../src/drivers/FileTree.js";
import ObjectMap from "../../src/drivers/ObjectMap.js";
import clear from "../../src/operations/clear.js";
import plain from "../../src/operations/plain.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const tempDirectory = path.join(dirname, "fixtures/temp");

describe("clear", () => {
  test("unsets all public keys in an object tree", async () => {
    const tree = new ObjectMap({ a: 1, b: 2, c: 3 });
    await clear(tree);
    assert.deepEqual(await plain(tree), {});
  });

  test("unsets all public keys in a file tree", async () => {
    // Create a temp directory with some files
    await fs.mkdir(tempDirectory, { recursive: true });
    await fs.writeFile(path.join(tempDirectory, "a"), "1");
    await fs.writeFile(path.join(tempDirectory, "b"), "2");

    const tree = new FileTree(tempDirectory);
    await clear(tree);

    const files = await fs.readdir(tempDirectory);
    assert.deepEqual(files, []);

    // Remove temp directory
    await fs.rm(tempDirectory, { recursive: true });
  });
});
