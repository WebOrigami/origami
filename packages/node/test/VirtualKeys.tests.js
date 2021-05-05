import chai from "chai";
import path from "path";
import { fileURLToPath } from "url";
import Files from "../src/Files.js";
import VirtualKeys from "../src/VirtualKeys.js";
const { assert } = chai;

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = path.join(dirname, "fixtures");
const directory = path.join(fixturesDirectory, "VirtualKeys");
const files = new Files(directory);

describe("VirtualKeys", () => {
  it("can load keys from a .keys.json value", async () => {
    const virtualKeys = new VirtualKeys(files);
    const keys = await virtualKeys.keys();
    assert.deepEqual(keys, [".keys.json", "a", "b", "c"]);
  });
});
