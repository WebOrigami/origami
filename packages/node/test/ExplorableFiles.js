import chai from "chai";
import path from "path";
import { fileURLToPath } from "url";
import ExplorableFiles from "../src/ExplorableFiles.js";
const { assert } = chai;

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = path.join(dirname, "fixtures");

describe("ExplorableFiles", () => {
  it.skip("Can return the set of files in a folder tree", () => {
    const directory = path.join(fixturesDirectory, "folder1");
    const files = new ExplorableFiles(directory);
    assert(files);
  });
});
