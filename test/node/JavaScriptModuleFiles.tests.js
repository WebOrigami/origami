import path from "path";
import { fileURLToPath } from "url";
import JavaScriptModuleFiles from "../../src/node/JavaScriptModuleFiles.js";
import assert from "../assert.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = path.join(dirname, "fixtures");

describe("JavaScriptModuleFiles", () => {
  it("Gets the exports of the file named by the key", async () => {
    const modules = new JavaScriptModuleFiles(fixturesDirectory);
    const result = await modules.get("module1.js");
    assert.equal(result.default, "This is the default export.");
  });
});
