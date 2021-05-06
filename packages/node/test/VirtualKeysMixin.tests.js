import chai from "chai";
import path from "path";
import { fileURLToPath } from "url";
import Files from "../src/Files.js";
import VirtualKeysMixin from "../src/VirtualKeysMixin.js";
const { assert } = chai;

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = path.join(dirname, "fixtures");
const virtualKeysFolder = path.join(fixturesDirectory, "virtualKeys");

class VirtualKeysFiles extends VirtualKeysMixin(Files) {}

describe("VirtualKeysMixin", () => {
  it("can load keys from a .keys.json value", async () => {
    const virtualKeys = new VirtualKeysFiles(virtualKeysFolder);
    const keys = await virtualKeys.keys();
    assert.deepEqual(keys, [".keys.json", "a", "b", "c"]);
  });
});
