import { asyncGet, asyncOps } from "@explorablegraph/core";
import chai from "chai";
import path from "path";
import { fileURLToPath } from "url";
import Files from "../src/Files.js";
const { assert } = chai;

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = path.join(dirname, "fixtures");

describe("Files", () => {
  it("Can return the set of files in a folder tree", async () => {
    const directory = path.join(fixturesDirectory, "folder1");
    const files = new Files(directory);
    const structure = await asyncOps.structure(files);
    assert.deepEqual(structure, {
      "a.txt": null,
      "b.txt": null,
      "c.txt": null,
      more: {
        "d.txt": null,
        "e.txt": null,
      },
    });
  });

  it("Can return the contents of files in a folder tree", async () => {
    const directory = path.join(fixturesDirectory, "folder1");
    const files = new Files(directory);
    const plain = await asyncOps.strings(files);
    assert.deepEqual(plain, {
      "a.txt": "The letter A",
      "b.txt": "The letter B",
      "c.txt": "The letter C",
      more: {
        "d.txt": "The letter D",
        "e.txt": "The letter E",
      },
    });
  });

  it("Can retrieve a file", async () => {
    const directory = path.join(fixturesDirectory, "folder1");
    const files = new Files(directory);
    const file = await files[asyncGet]("a.txt");
    assert.equal(String(file), "The letter A");
  });

  it("Can traverse a path of keys in a folder tree", async () => {
    const directory = path.join(fixturesDirectory, "folder1");
    const files = new Files(directory);
    const file = await files[asyncGet]("more", "e.txt");
    assert.equal(String(file), "The letter E");
  });
});
