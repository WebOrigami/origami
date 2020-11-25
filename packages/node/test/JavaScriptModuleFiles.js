import chai from "chai";
import path from "path";
import { fileURLToPath } from "url";
import JavaScriptModuleFiles from "../src/JavaScriptModuleFiles.js";
const { assert } = chai;

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = path.join(dirname, "fixtures");

describe.skip("JavaScriptModuleFiles", () => {
  it("Gets the exports of the file named by the key", async () => {
    const modules = new JavaScriptModuleFiles(fixturesDirectory);
    const result = await modules[JavaScriptModuleFiles.get]("module1.js");
    assert.equal(result.default, "This is the default export.");
  });
});
