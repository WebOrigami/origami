import assert from "node:assert";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import projectConfig from "../../src/project/projectConfig.js";

describe("projectConfig", () => {
  test.only("finds Origami configuration file", async () => {
    // Find the folder that represents the project root.
    const projectUrl = new URL("fixtures/withConfig/", import.meta.url);
    // Find subfolder inside project root.
    const subfolderUrl = new URL("./subfolder/", projectUrl);
    const subfolderPath = fileURLToPath(subfolderUrl);

    const config = await projectConfig(subfolderPath);
    assert.equal(config.message, "Hello");
  });

  test("defaults to an empty object", async () => {
    // Find the folder that represents the project root.
    const projectUrl = new URL("fixtures/withPackageJson/", import.meta.url);
    // Find subfolder inside project root.
    const subfolderUrl = new URL("./subfolder/", projectUrl);
    const subfolderPath = fileURLToPath(subfolderUrl);

    const config = await projectConfig(subfolderPath);
    assert.deepEqual(config, {});
  });
});
