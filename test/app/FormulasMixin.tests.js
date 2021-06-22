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

describe.only("FormulasMixin", () => {
  it("yields virtual keys", async () => {
    assert.deepEqual(await ExplorableGraph.keys(virtualFiles), [
      "foo.txt",
      "sampleJson",
    ]);
  });

  // it("can load keys from a .keys.json value", async () => {
  //   const virtualKeys = new VirtualKeysFiles(virtualKeysFolder);
  //   const keys = await ExplorableGraph.keys(virtualKeys);
  //   assert.deepEqual(keys, ["a", "b", "c", ".keys.json"]);
  // });
});
