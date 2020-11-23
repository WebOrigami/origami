import { AsyncExplorable } from "@explorablegraph/async";
import chai from "chai";
import path from "path";
import { fileURLToPath } from "url";
import ExplorableFiles from "../src/ExplorableFiles.js";
const { assert } = chai;

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = path.join(dirname, "fixtures");

describe("ExplorableFiles", () => {
  it("Can return the set of files in a folder tree", async () => {
    const directory = path.join(fixturesDirectory, "folder1");
    const files = new ExplorableFiles(directory);
    const structure = await AsyncExplorable.structure(files);
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

  it.skip("Can return the contents of files in a folder tree", async () => {
    const directory = path.join(fixturesDirectory, "folder1");
    const files = new ExplorableFiles(directory);
    const plain = await AsyncExplorable.plain(files);
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
});
