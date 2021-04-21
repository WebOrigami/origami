import chai from "chai";
import path from "path";
import { fileURLToPath } from "url";
import ParentFiles from "../src/ParentFiles.js";
const { assert } = chai;

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = path.join(dirname, "fixtures");

describe("ParentFiles", () => {
  it("looks up for a file that exists", async () => {
    const folder = path.join(fixturesDirectory, "folder1");
    const parentFiles = new ParentFiles(folder);
    const configPath = await parentFiles.get("test.config");
    const expectedPath = path.join(fixturesDirectory, "test.config");
    assert(configPath, expectedPath);
  });

  it("returns undefined for a file that doesn't exist", async () => {
    const folder = path.join(fixturesDirectory, "folder1");
    const parentFiles = new ParentFiles(folder);
    const configPath = await parentFiles.get("doesnotexist");
    assert.isUndefined(configPath);
  });
});
