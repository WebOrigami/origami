import path from "node:path";
import { fileURLToPath } from "node:url";
import ImplicitModulesTransform from "../../src/common/ImplicitModulesTransform.js";
import FilesGraph from "../../src/core/FilesGraph.js";
import assert from "../assert.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = path.join(dirname, "fixtures");
const modules = new (ImplicitModulesTransform(FilesGraph))(fixturesDirectory);

describe("ImplicitModulesTransform", () => {
  it("Gets the exports of the .js file named by the key", async () => {
    const result = await modules.get("text");
    assert.equal(result, "This is the default export.");
  });
});
