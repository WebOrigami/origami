import chai from "chai";
import path from "path";
import { fileURLToPath } from "url";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ExplorableObject from "../../src/core/ExplorableObject.js";
import ExplorableFiles from "../../src/node/ExplorableFiles.js";
import VirtualKeysMixin from "../../src/node/VirtualKeysMixin.js";
const { assert } = chai;

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = path.join(dirname, "fixtures");
const virtualKeysFolder = path.join(fixturesDirectory, "virtualKeys");

class VirtualKeysFiles extends VirtualKeysMixin(ExplorableFiles) {}

describe("VirtualKeysMixin", () => {
  it("yields keys from .keys.json before other keys", async () => {
    const graph = new (VirtualKeysMixin(ExplorableObject))({
      a: 1,
      b: 2,
      c: 3,
      e: 5,
      ".keys.json": ["d", "c", "b", "a"],
    });
    assert.deepEqual(await ExplorableGraph.keys(graph), [
      "d",
      "c",
      "b",
      "a",
      "e",
      ".keys.json",
    ]);
  });

  it("can load keys from a .keys.json value", async () => {
    const virtualKeys = new VirtualKeysFiles(virtualKeysFolder);
    const keys = await ExplorableGraph.keys(virtualKeys);
    assert.deepEqual(keys, ["a", "b", "c", ".keys.json"]);
  });
});
