import { FileTree, ObjectTree, Tree } from "@weborigami/async-tree";
import assert from "node:assert";
import * as fs from "node:fs/promises";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import clean from "../../src/tree/clean.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const tempDirectory = path.join(dirname, "fixtures/temp");

describe("clean", () => {
  test("unsets all public keys in an object tree", async () => {
    const tree = new ObjectTree({ a: 1, b: 2, c: 3 });
    await clean.call(null, tree);
    assert.deepEqual(await Tree.plain(tree), {});
  });

  test("unsets all public keys in a file tree", async () => {
    // Create a temp directory with some files
    await fs.mkdir(tempDirectory, { recursive: true });
    await fs.writeFile(path.join(tempDirectory, "a"), "1");
    await fs.writeFile(path.join(tempDirectory, "b"), "2");

    const tree = new FileTree(tempDirectory);
    await clean.call(null, tree);

    const files = await fs.readdir(tempDirectory);
    assert.deepEqual(files, []);

    // Remove temp directory
    await fs.rm(tempDirectory, { recursive: true });
  });
});
