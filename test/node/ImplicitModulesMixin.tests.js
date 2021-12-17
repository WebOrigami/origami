import path from "path";
import { fileURLToPath } from "url";
import ExplorableFiles from "../../src/node/ExplorableFiles.js";
import ImplicitModulesTransform from "../../src/node/ImplicitModulesTransform.js";
import assert from "../assert.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = path.join(dirname, "fixtures");
const modules = new (ImplicitModulesTransform(ExplorableFiles))(
  fixturesDirectory
);

describe("ImplicitModulesTransform", () => {
  it("Gets the exports of the .js file named by the key", async () => {
    const result = await modules.get("module1");
    assert.equal(result, "This is the default export.");
  });
});
