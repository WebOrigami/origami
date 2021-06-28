import path from "path";
import { fileURLToPath } from "url";
import ExplorableFiles from "../../src/node/ExplorableFiles.js";
import ModulesDefaultExportMixin from "../../src/node/ModulesDefaultExportMixin.js";
import assert from "../assert.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = path.join(dirname, "fixtures");
const modules = new (ModulesDefaultExportMixin(ExplorableFiles))(
  fixturesDirectory
);

describe("ModulesDefaultExportMixin", () => {
  it("Gets the exports of the file named by the key", async () => {
    const result = await modules.get("module1.js");
    assert.equal(result, "This is the default export.");
  });
});
