import { ExplorableObject } from "@explorablegraph/core";
import chai from "chai";
import * as fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import unlinkFiles from "../src/unlinkFiles.js";
import writeFiles from "../src/writeFiles.js";
const { assert } = chai;

const dirname = path.dirname(fileURLToPath(import.meta.url));
const tempDirectory = path.join(dirname, "fixtures/temp");

describe("unlinkFiles", () => {
  beforeEach(async () => {
    await fs.mkdir(tempDirectory, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(tempDirectory, { recursive: true });
  });

  it("removes the files defines by a graph", async () => {
    // Create a file in a subfolder.
    const files = new ExplorableObject({
      subfolder: {
        file: "This is a file in the graph.",
      },
    });
    await writeFiles(tempDirectory, files);

    // Add an extra file that's not in the set.
    const extraPath = path.join(tempDirectory, "extra");
    await fs.writeFile(extraPath, "This is an extra file.");

    // Clean out the files in the graph.
    await unlinkFiles(tempDirectory, files);

    // Confirm that the file in the graph was removed.
    let file;
    try {
      const filePath = path.join(tempDirectory, "subfolder/file");
      file = await fs.readFile(filePath);
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
    assert(!file);

    // Check that the extra file was left alone.
    const extraFile = await fs.readFile(extraPath);
    assert(extraFile);
  });
});
