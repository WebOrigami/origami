import path from "node:path";
import { fileURLToPath } from "node:url";
import FilesGraph from "../../src/core/FilesGraph.js";
import ImplicitModulesTransform from "../../src/framework/ImplicitModulesTransform.js";
import ImportModulesMixin from "../../src/framework/ImportModulesMixin.js";
import assert from "../assert.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = path.join(dirname, "fixtures");
const modules = new (ImplicitModulesTransform(ImportModulesMixin(FilesGraph)))(
  fixturesDirectory
);

describe("ImplicitModulesTransform", () => {
  it("Gets the exports of the .js file named by the key", async () => {
    const result = await modules.get("text");
    assert.equal(result, "This is the default export.");
  });
});
