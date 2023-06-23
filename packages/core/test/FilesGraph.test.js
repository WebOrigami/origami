import assert from "node:assert";
import * as fs from "node:fs/promises";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import FilesGraph from "../src/FilesGraph.js";
import GraphHelpers from "../src/GraphHelpers.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const tempDirectory = path.join(dirname, "fixtures/temp");

describe("FilesGraph", async () => {
  test("can get the keys of the graph", async () => {
    const fixture = createFixture("fixtures/markdown");
    assert.deepEqual(
      [...(await fixture.keys())],
      ["Alice.md", "Bob.md", "Carol.md"]
    );
  });

  test("can get the value for a key", async () => {
    const fixture = createFixture("fixtures/markdown");
    const alice = await fixture.get("Alice.md");
    assert.equal(alice, "Hello, **Alice**.");
  });

  test("getting an unsupported key returns undefined", async () => {
    const fixture = createFixture("fixtures/markdown");
    assert.equal(await fixture.get("xyz"), undefined);
  });

  test("can indicate which values are explorable", async () => {
    const fixture = createFixture("fixtures");
    assert(await fixture.isKeyForSubgraph("markdown"));
    const markdown = await fixture.get("markdown");
    assert(!(await markdown.isKeyForSubgraph("a.txt")));
  });

  test("getting undefined returns the graph itself", async () => {
    const fixture = createFixture("fixtures");
    const result = await fixture.get(undefined);
    assert.equal(result, fixture);
  });

  test("can write out a file via set()", async () => {
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
    const tempFiles = new FilesGraph(tempDirectory);
    await tempFiles.set("folder", obj);

    // Read them back in.
    const actualFiles = await tempFiles.get("folder");
    const strings = await GraphHelpers.map(actualFiles, (buffer) =>
      String(buffer)
    );
    const plain = await GraphHelpers.plain(strings);
    assert.deepEqual(plain, obj);

    await removeTempDirectory();
  });

  test("can delete a file via set()", async () => {
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
    assert(stats === undefined);
    await removeTempDirectory();
  });

  test("can delete a folder via set()", async () => {
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
    assert(stats === undefined);
    await removeTempDirectory();
  });
});

function createFixture(fixturePath) {
  return new FilesGraph(path.join(dirname, fixturePath));
}

async function createTempDirectory() {
  await fs.mkdir(tempDirectory, { recursive: true });
}

async function removeTempDirectory() {
  await fs.rm(tempDirectory, { recursive: true });
}
