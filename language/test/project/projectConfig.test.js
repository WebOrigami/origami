import { FileMap } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import projectConfig from "../../src/project/projectConfig.js";

describe("projectConfig", () => {
  test("loads Origami configuration file if present", async () => {
    // The folder that represents the project root
    const projectFiles = new FileMap(
      new URL("fixtures/withConfig/", import.meta.url),
    );
    const subfolder = await projectFiles.get("subfolder");
    const config = await projectConfig(subfolder);
    assert.equal(config.message, "Hello");
  });

  test("defaults to an empty object", async () => {
    // The folder that represents the project root
    const projectFiles = new FileMap(
      new URL("fixtures/withPackageJson/", import.meta.url),
    );
    const subfolder = await projectFiles.get("subfolder");
    const config = await projectConfig(subfolder);
    assert.deepEqual(config, {});
  });
});
