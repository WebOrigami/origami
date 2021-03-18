import { AsyncExplorable, asyncOps } from "@explorablegraph/core";
import chai from "chai";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Files from "../src/Files.js";
import writeFiles from "../src/writeFiles.js";
const { assert } = chai;

const dirname = path.dirname(fileURLToPath(import.meta.url));
const tempDirectory = path.join(dirname, "fixtures/temp");

describe("writeFiles", () => {
  beforeEach(async () => {
    await fs.mkdir(tempDirectory, { recursive: true });
  });

  afterEach(async () => {
    await fs.rmdir(tempDirectory, { recursive: true });
  });

  it("creates files from a graph", async () => {
    // Create a tiny set of "files".
    const obj = {
      file1: "This is the first file.",
      subfolder: {
        file2: "This is the second file.",
      },
    };
    const files = new AsyncExplorable(obj);

    // Write out files.
    await writeFiles(tempDirectory, files);

    // Read them back in.
    const tempFiles = new Files(tempDirectory);
    const actual = await asyncOps.strings(tempFiles);
    assert.deepEqual(actual, obj);
  });
});
