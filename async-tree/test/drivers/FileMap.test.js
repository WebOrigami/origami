import assert from "node:assert";
import * as fs from "node:fs";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import FileMap from "../../src/drivers/FileMap.js";
import { Tree } from "../../src/internal.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const tempDirectory = path.join(dirname, "fixtures/temp");

const textDecoder = new TextDecoder();

describe("FileMap", () => {
  test("can get the keys of the tree", () => {
    const fixture = createFixture("fixtures/markdown");
    assert.deepEqual(Array.from(fixture.keys()), [
      "Alice.md",
      "Bob.md",
      "Carol.md",
      "subfolder/",
    ]);
  });

  test("can get the value for a key", () => {
    const fixture = createFixture("fixtures/markdown");
    const buffer = fixture.get("Alice.md");
    const text = textDecoder.decode(buffer);
    assert.equal(text, "Hello, **Alice**.");
  });

  test("getting an unsupported key returns undefined", () => {
    const fixture = createFixture("fixtures/markdown");
    assert.equal(fixture.get("xyz"), undefined);
  });

  test("getting empty key returns undefined", () => {
    const fixture = createFixture("fixtures/markdown");
    assert.equal(fixture.get(""), undefined);
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

  test("can retrieve values with optional trailing slash", () => {
    const fixture = createFixture("fixtures/markdown");
    assert(fixture.get("Alice.md"));
    assert(fixture.get("Alice.md/"));
    assert(fixture.get("subfolder"));
    assert(fixture.get("subfolder/"));
  });

  test("sets parent on subtrees", () => {
    const fixture = createFixture("fixtures");
    const markdown = fixture.get("markdown");
    assert.deepEqual(markdown.parent, fixture);
  });

  test("can write out a file via set()", () => {
    createTempDirectory();

    // Write out a file.
    const fileName = "file1";
    const fileText = "This is the first file.";
    const tempFiles = new FileMap(tempDirectory);
    tempFiles.set(fileName, fileText);

    // Read it back in.
    const filePath = path.join(tempDirectory, fileName);
    const actualText = String(fs.readFileSync(filePath));

    assert.equal(fileText, actualText);

    removeTempDirectory();
  });

  test("create subfolder via set() with empty Map", () => {
    createTempDirectory();

    // Write out new, empty folder called "empty".
    const tempFiles = new FileMap(tempDirectory);
    tempFiles.set("empty", new Map());

    // Verify folder exists and has no contents.
    const folderPath = path.join(tempDirectory, "empty");
    const stats = fs.statSync(folderPath);
    assert(stats.isDirectory());
    const files = fs.readdirSync(folderPath);
    assert.deepEqual(files, []);

    removeTempDirectory();
  });

  test("can write out subfolder via set()", async () => {
    createTempDirectory();

    // Create a tiny set of "files".
    // @ts-ignore
    const files = new Map([
      ["file1", "This is the first file."],
      ["subfolder", new Map([["file2", "This is the second file."]])],
    ]);
    const object = await Tree.plain(files);

    // Write out files as a new folder called "folder".
    const tempFiles = new FileMap(tempDirectory);
    tempFiles.set("folder", files);

    // Read them back in.
    const actualFiles = tempFiles.get("folder");
    const strings = await Tree.map(actualFiles, {
      deep: true,
      value: (buffer) => textDecoder.decode(buffer),
    });
    const plain = await Tree.plain(strings);
    assert.deepEqual(plain, object);

    removeTempDirectory();
  });

  test("can delete a file", () => {
    createTempDirectory();
    const tempFile = path.join(tempDirectory, "file");
    fs.writeFileSync(tempFile, "");
    const tempFiles = new FileMap(tempDirectory);
    tempFiles.delete("file");
    let stats;
    try {
      stats = fs.statSync(tempFile);
    } catch (/** @type {any} */ error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
    assert(stats === undefined);
    removeTempDirectory();
  });

  test("can delete a folder", () => {
    createTempDirectory();
    const folder = path.join(tempDirectory, "folder");
    fs.mkdirSync(folder);
    const tempFiles = new FileMap(tempDirectory);
    tempFiles.delete("folder");
    let stats;
    try {
      stats = fs.statSync(folder);
    } catch (/** @type {any} */ error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
    assert(stats === undefined);
    removeTempDirectory();
  });
});

function createFixture(fixturePath) {
  return new FileMap(path.join(dirname, fixturePath));
}

function createTempDirectory() {
  fs.mkdirSync(tempDirectory, { recursive: true });
}

function removeTempDirectory() {
  fs.rmSync(tempDirectory, { recursive: true });
}
