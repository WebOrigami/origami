import chai from "chai";
import * as fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { ExplorableGraph } from "../../core/exports.js";
import Files from "../src/Files.js";
const { assert } = chai;

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = path.join(dirname, "fixtures");
const tempDirectory = path.join(dirname, "fixtures/temp");

describe("Files", () => {
  it("Can return the set of files in a folder tree", async () => {
    const directory = path.join(fixturesDirectory, "folder1");
    const files = new Files(directory);
    const structure = await files.structure();
    assert.deepEqual(structure, {
      "a.txt": null,
      "b.txt": null,
      "c.txt": null,
      more: {
        "d.txt": null,
        "e.txt": null,
      },
    });
  });

  it("Can return the contents of files in a folder tree", async () => {
    const directory = path.join(fixturesDirectory, "folder1");
    const files = new Files(directory);
    const plain = await files.strings();
    assert.deepEqual(plain, {
      "a.txt": "The letter A",
      "b.txt": "The letter B",
      "c.txt": "The letter C",
      more: {
        "d.txt": "The letter D",
        "e.txt": "The letter E",
      },
    });
  });

  it("Can retrieve a file", async () => {
    const directory = path.join(fixturesDirectory, "folder1");
    const files = new Files(directory);
    const file = await files.get("a.txt");
    assert.equal(String(file), "The letter A");
  });

  it("Can traverse a path of keys in a folder tree", async () => {
    const directory = path.join(fixturesDirectory, "folder1");
    const files = new Files(directory);
    const file = await files.get("more", "e.txt");
    assert.equal(String(file), "The letter E");
  });

  it("can write out a file via set()", async () => {
    await createTempDirectory();

    // Write out a file.
    const fileName = "file1";
    const fileText = "This is the first file.";
    const tempFiles = new Files(tempDirectory);
    await tempFiles.set(fileName, fileText);

    // Read it back in.
    const filePath = path.join(tempDirectory, fileName);
    const actualText = String(await fs.readFile(filePath));

    assert.equal(fileText, actualText);

    await removeTempDirectory();
  });

  it("can write out multiple files via set()", async () => {
    await createTempDirectory();

    // Create a tiny set of "files".
    const obj = {
      file1: "This is the first file.",
      subfolder: {
        file2: "This is the second file.",
      },
    };
    const files = new ExplorableGraph(obj);

    // Write out files.
    const tempFiles = new Files(tempDirectory);
    await tempFiles.set(files);

    // Read them back in.
    const actualFiles = new Files(tempDirectory);
    const actualStrings = await actualFiles.strings();
    assert.deepEqual(actualStrings, obj);

    await removeTempDirectory();
  });

  it("can create an empty directory via set()", async () => {
    await createTempDirectory();
    const tempFiles = new Files(tempDirectory);
    await tempFiles.set("folder", null);
    const tempFolder = path.join(tempDirectory, "folder");
    const stats = await fs.stat(tempFolder);
    assert(stats.isDirectory());
    await removeTempDirectory();
  });

  it("can delete a file via set()", async () => {
    await createTempDirectory();
    const tempFile = path.join(tempDirectory, "file");
    await fs.writeFile(tempFile, "");
    const tempFiles = new Files(tempDirectory);
    await tempFiles.set("file", undefined);
    let stats;
    try {
      stats = await fs.stat(tempFile);
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
    assert.isUndefined(stats);
    await removeTempDirectory();
  });

  it("can delete a folder via set()", async () => {
    await createTempDirectory();
    const folder = path.join(tempDirectory, "folder");
    await fs.mkdir(folder);
    const tempFiles = new Files(tempDirectory);
    await tempFiles.set("folder", undefined);
    let stats;
    try {
      stats = await fs.stat(folder);
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
    assert.isUndefined(stats);
    await removeTempDirectory();
  });
});

async function createTempDirectory() {
  await fs.mkdir(tempDirectory, { recursive: true });
}

async function removeTempDirectory() {
  await fs.rm(tempDirectory, { recursive: true });
}
