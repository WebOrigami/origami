import assert from "node:assert";
import path from "node:path";
import process from "node:process";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import project from "../../src/origami/project.js";

describe("@project", () => {
  test("finds Origami configuration file", async () => {
    // Find the folder that represents a project root.
    const projectUrl = new URL("fixtures/config/", import.meta.url);
    // Pick a subfolder of that.
    const subfolderUrl = new URL("./code/", projectUrl);

    // @project references curdir, so we need to change that temporarily.
    // However, @project is async and we don't want the current directory
    // changed while other tests run. As it turns out, @project gets the current
    // directory before doing any async work. If we get a promise for the
    // result, we should be able to change the current directory back before
    // other tests run. We can then await the result.
    const saveDir = process.cwd();
    process.chdir(fileURLToPath(subfolderUrl));
    const promise = project.call(null);
    process.chdir(saveDir);
    const result = await promise;

    // Get result path, it'll need a trailing slash to compare.
    const resultPath = result.path + path.sep;
    assert.equal(resultPath, fileURLToPath(projectUrl));
  });
});
