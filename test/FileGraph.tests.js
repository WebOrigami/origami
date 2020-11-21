import chai from "chai";
import path from "path";
import { fileURLToPath } from "url";
import FileGraph from "../src/FileGraph.js";
const { assert } = chai;

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

describe("FileGraph", () => {
  it("can read a directory tree and its contents", async () => {
    const dirname = path.join(currentDirectory, "fixtures/test1");
    const buffers = new FileGraph(dirname);
    // Translate the Buffers in the graph to strings.
    const strings = await buffers.reduce(async (obj) => String(obj));
    assert.deepEqual(strings, {
      "a.txt": "The letter A",
      "b.txt": "The letter B",
      "c.txt": "The letter C",
      more: {
        "d.txt": "The letter D",
        "e.txt": "The letter E",
        "f.txt": "The letter F",
      },
    });
  });
});
