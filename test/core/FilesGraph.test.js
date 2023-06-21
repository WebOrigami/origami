import * as fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import setDeep from "../../src/builtins/@graph/setDeep.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import FilesGraph from "../../src/core/FilesGraph.js";
import assert from "../assert.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = path.join(dirname, "fixtures");
const tempDirectory = path.join(dirname, "fixtures/temp");

describe("FilesGraph", () => {
  it("can return the set of files in a folder tree", async () => {
    const directory = path.join(fixturesDirectory, "folder1");
    const files = new FilesGraph(directory);
    assert.deepEqual(Array.from(await files.keys()), [
      "a.txt",
      "b.txt",
      "c.txt",
      "more",
    ]);
    const more = await files.get("more");
    assert.deepEqual(Array.from(await more.keys()), ["d.txt", "e.txt"]);
  });

  it("returns the same FilesGraph for the same subfolder", async () => {
    const fixtures = new FilesGraph(fixturesDirectory);
    const files1 = await fixtures.get("folder1");
    const files2 = await fixtures.get("folder1");
    assert.strictEqual(files1, files2);
  });

  it("can return the contents of files in a folder tree", async () => {
    const directory = path.join(fixturesDirectory, "folder1");
    const files = new FilesGraph(directory);
    const plain = await ExplorableGraph.toSerializable(files);
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

  it("getting undefined returns the graph itself", async () => {
    const files = new FilesGraph(fixturesDirectory);
    const result = await files.get(undefined);
    assert.equal(result, files);
  });

  it("can retrieve a file", async () => {
    const directory = path.join(fixturesDirectory, "folder1");
    const files = new FilesGraph(directory);
    const file = await files.get("a.txt");
    assert.equal(String(file), "The letter A");
  });

  it("can traverse a path of keys in a folder tree", async () => {
    const directory = path.join(fixturesDirectory, "folder1");
    const files = new FilesGraph(directory);
    const file = await ExplorableGraph.traverse(files, "more", "e.txt");
    assert.equal(String(file), "The letter E");
  });

  it("can write out a file via set()", async () => {
    await createTempDirectory();

    // Write out a file.
    const fileName = "file1";
    const fileText = "This is the first file.";
    const tempFiles = new FilesGraph(tempDirectory);
    await tempFiles.set(fileName, fileText);

    // Read it back in.
    const filePath = path.join(tempDirectory, fileName);
    const actualText = String(await fs.readFile(filePath));

    assert.equal(fileText, actualText);

    await removeTempDirectory();
  });

  it("can write out multiple files via setDeep()", async () => {
    await createTempDirectory();

    // Create a tiny set of "files".
    const obj = {
      file1: "This is the first file.",
      subfolder: {
        file2: "This is the second file.",
      },
    };

    // Write out files.
    const tempFiles = new FilesGraph(tempDirectory);
    await setDeep(tempFiles, obj);

    // Read them back in.
    const actualFiles = new FilesGraph(tempDirectory);
    const actualStrings = await ExplorableGraph.toSerializable(actualFiles);
    assert.deepEqual(actualStrings, obj);

    await removeTempDirectory();
  });

  it("can delete a file via set()", async () => {
    await createTempDirectory();
    const tempFile = path.join(tempDirectory, "file");
    await fs.writeFile(tempFile, "");
    const tempFiles = new FilesGraph(tempDirectory);
    await tempFiles.set("file", undefined);
    let stats;
    try {
      stats = await fs.stat(tempFile);
    } catch (/** @type {any} */ error) {
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
    const tempFiles = new FilesGraph(tempDirectory);
    await tempFiles.set("folder", undefined);
    let stats;
    try {
      stats = await fs.stat(folder);
    } catch (/** @type {any} */ error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
    assert.isUndefined(stats);
    await removeTempDirectory();
  });

  it("can indicate which values are explorable", async () => {
    const graph = new FilesGraph(fixturesDirectory);
    assert(await ExplorableGraph.isKeyExplorable(graph, "folder1"));
    const folder1 = await graph.get("folder1");
    assert(!(await ExplorableGraph.isKeyExplorable(folder1, "a.txt")));
  });
});

async function createTempDirectory() {
  await fs.mkdir(tempDirectory, { recursive: true });
}

async function removeTempDirectory() {
  await fs.rm(tempDirectory, { recursive: true });
}
