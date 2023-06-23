import assert from "node:assert";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import FilesGraph from "../../src/core/FilesGraph.js";
import ImplicitModulesTransform from "../../src/framework/ImplicitModulesTransform.js";
import ImportModulesMixin from "../../src/framework/ImportModulesMixin.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = path.join(dirname, "fixtures");
const modules = new (ImplicitModulesTransform(ImportModulesMixin(FilesGraph)))(
  fixturesDirectory
);

describe("ImplicitModulesTransform", () => {
  test("Gets the exports of the .js file named by the key", async () => {
    const result = await modules.get("text");
    assert.equal(result, "This is the default export.");
  });
});
