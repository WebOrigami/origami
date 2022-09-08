import path from "node:path";
import { fileURLToPath } from "node:url";
import ParentFiles from "../../src/node/ParentFiles.js";
import assert from "../assert.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = path.join(dirname, "fixtures");

describe("ParentFiles", () => {
  it("looks up for a file that exists", async () => {
    const folder = path.join(fixturesDirectory, "folder1");
    const parentFiles = new ParentFiles(folder);
    const configPath = await parentFiles.get("test.config");
    const expectedPath = path.join(fixturesDirectory, "test.config");
    assert.equal(configPath, expectedPath);
  });

  it("returns undefined for a file that doesn't exist", async () => {
    const folder = path.join(fixturesDirectory, "folder1");
    const parentFiles = new ParentFiles(folder);
    const configPath = await parentFiles.get("doesnotexist");
    assert.isUndefined(configPath);
  });
});
