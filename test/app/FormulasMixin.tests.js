import path from "path";
import { fileURLToPath } from "url";
import FormulasMixin from "../../src/app/FormulasMixin.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ExplorableFiles from "../../src/node/ExplorableFiles.js";
import assert from "../assert.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = path.join(dirname, "fixtures");
const directory = path.join(fixturesDirectory, "formulas");

class VirtualFiles extends FormulasMixin(ExplorableFiles) {}
const virtualFiles = new VirtualFiles(directory);

describe("FormulasMixin", () => {
  it("keys include both real and virtual keys", async () => {
    assert.deepEqual(await ExplorableGraph.keys(virtualFiles), [
      "foo.txt",
      "sampleJson",
    ]);
  });

  it("can get the value of a virtual key", async () => {
    const value = await virtualFiles.get("sampleJson");
    assert(ExplorableGraph.isExplorable(value));
    assert.deepEqual(await ExplorableGraph.plain(value), {
      a: "Hello, a.",
      b: "Hello, b.",
      c: "Hello, c.",
    });
    assert.equal(await virtualFiles.get("sampleJson", "a"), "Hello, a.");
  });
});
