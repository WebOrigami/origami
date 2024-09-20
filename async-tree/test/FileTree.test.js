import assert from "node:assert";
import * as fs from "node:fs/promises";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import FileTree from "../src/FileTree.js";
import { Tree } from "../src/internal.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const tempDirectory = path.join(dirname, "fixtures/temp");

const textDecoder = new TextDecoder();

describe("FileTree", async () => {
  test("can get the keys of the tree", async () => {
    const fixture = createFixture("fixtures/markdown");
    assert.deepEqual(Array.from(await fixture.keys()), [
      "Alice.md",
      "Bob.md",
      "Carol.md",
      "subfolder/",
    ]);
  });

  test("can get the value for a key", async () => {
    const fixture = createFixture("fixtures/markdown");
    const buffer = await fixture.get("Alice.md");
    const text = textDecoder.decode(buffer);
    assert.equal(text, "Hello, **Alice**.");
  });

  test("getting an unsupported key returns undefined", async () => {
    const fixture = createFixture("fixtures/markdown");
    assert.equal(await fixture.get("xyz"), undefined);
  });

  test("getting a null/undefined key throws an exception", async () => {
    const fixture = createFixture("fixtures/markdown");
    await assert.rejects(async () => {
      await fixture.get(null);
    });
    await assert.rejects(async () => {
      await fixture.get(undefined);
    });
  });

  test("can retrieve values with optional trailing slash", async () => {
    const fixture = createFixture("fixtures/markdown");
    assert(await fixture.get("Alice.md"));
    assert(await fixture.get("Alice.md/"));
    assert(await fixture.get("subfolder"));
    assert(await fixture.get("subfolder/"));
  });

  test("sets parent on subtrees", async () => {
    const fixture = createFixture("fixtures");
    const markdown = await fixture.get("markdown");
    assert.equal(markdown.parent, fixture);
  });

  test("can indicate which values are subtrees", async () => {
    const fixture = createFixture("fixtures/markdown");
    assert(!(await fixture.isKeyForSubtree("Alice.md")));
    assert(await fixture.isKeyForSubtree("subfolder"));
    assert(await fixture.isKeyForSubtree("subfolder/"));
  });

  test("can write out a file via set()", async () => {
    await createTempDirectory();

    // Write out a file.
    const fileName = "file1";
    const fileText = "This is the first file.";
    const tempFiles = new FileTree(tempDirectory);
    await tempFiles.set(fileName, fileText);

    // Read it back in.
    const filePath = path.join(tempDirectory, fileName);
    const actualText = String(await fs.readFile(filePath));

    assert.equal(fileText, actualText);

    await removeTempDirectory();
  });

  test("can create empty subfolder via set()", async () => {
    await createTempDirectory();

    // Write out new, empty folder called "empty".
    const tempFiles = new FileTree(tempDirectory);
    await tempFiles.set("empty", {});

    // Verify folder exists and has no contents.
    const folderPath = path.join(tempDirectory, "empty");
    const stats = await fs.stat(folderPath);
    assert(stats.isDirectory());
    const files = await fs.readdir(folderPath);
    assert.deepEqual(files, []);

    await removeTempDirectory();
  });

  test("can write out subfolder via set()", async () => {
    await createTempDirectory();

    // Create a tiny set of "files".
    const obj = {
      file1: "This is the first file.",
      subfolder: {
        file2: "This is the second file.",
      },
    };

    // Write out files as a new folder called "folder".
    const tempFiles = new FileTree(tempDirectory);
    await tempFiles.set("folder", obj);

    // Read them back in.
    const actualFiles = await tempFiles.get("folder");
    const strings = Tree.map(actualFiles, (buffer) =>
      textDecoder.decode(buffer)
    );
    const plain = await Tree.plain(strings);
    assert.deepEqual(plain, obj);

    await removeTempDirectory();
  });

  test("can delete a file via set()", async () => {
    await createTempDirectory();
    const tempFile = path.join(tempDirectory, "file");
    await fs.writeFile(tempFile, "");
    const tempFiles = new FileTree(tempDirectory);
    await tempFiles.set("file", undefined);
    let stats;
    try {
      stats = await fs.stat(tempFile);
    } catch (/** @type {any} */ error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
    assert(stats === undefined);
    await removeTempDirectory();
  });

  test("can delete a folder via set()", async () => {
    await createTempDirectory();
    const folder = path.join(tempDirectory, "folder");
    await fs.mkdir(folder);
    const tempFiles = new FileTree(tempDirectory);
    await tempFiles.set("folder", undefined);
    let stats;
    try {
      stats = await fs.stat(folder);
    } catch (/** @type {any} */ error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
    assert(stats === undefined);
    await removeTempDirectory();
  });
});

function createFixture(fixturePath) {
  return new FileTree(path.join(dirname, fixturePath));
}

async function createTempDirectory() {
  await fs.mkdir(tempDirectory, { recursive: true });
}

async function removeTempDirectory() {
  await fs.rm(tempDirectory, { recursive: true });
}
