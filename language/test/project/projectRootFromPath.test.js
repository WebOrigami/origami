import assert from "node:assert";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import projectRootFromPath from "../../src/project/projectRootFromPath.js";

describe("projectRootFromPath", () => {
  test("finds Origami configuration file", async () => {
    // Find the folder that represents the project root.
    const projectUrl = new URL("fixtures/withConfig/", import.meta.url);
    // Find subfolder inside project root.
    const subfolderUrl = new URL("./subfolder/", projectUrl);
    const subfolderPath = fileURLToPath(subfolderUrl);

    const root = await projectRootFromPath(subfolderPath);

    // Get result path, it'll need a trailing slash to compare.
    const resultPath = root.path + path.sep;
    assert.equal(resultPath, fileURLToPath(projectUrl));
  });

  test("finds package.json file", async () => {
    // Find the folder that represents the project root.
    const projectUrl = new URL("fixtures/withPackageJson/", import.meta.url);
    // Find subfolder inside project root.
    const subfolderUrl = new URL("./subfolder/", projectUrl);
    const subfolderPath = fileURLToPath(subfolderUrl);

    const root = await projectRootFromPath(subfolderPath);

    // Get result path, it'll need a trailing slash to compare.
    const resultPath = root.path + path.sep;
    assert.equal(resultPath, fileURLToPath(projectUrl));
  });

  test("defaults to supplied directory", async () => {
    const root = await projectRootFromPath("/");
    assert.equal(root.path, "/");
  });
});
