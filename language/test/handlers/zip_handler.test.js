import { Tree } from "@weborigami/async-tree";
import Zip from "adm-zip";
import assert from "node:assert";
import fs from "node:fs/promises";
import { describe, test } from "node:test";
import zip_handler from "../../src/handlers/zip_handler.js";

describe("ZIP handler", () => {
  test("creates a ZIP file as Buffer", async () => {
    const tree = {
      "ReadMe.md": "This is a ReadMe file.",
      sub: {
        "file.txt": "This is a text file in a subfolder.",
      },
    };
    const buffer = await zip_handler.pack(tree);
    const unzipped = new Zip(buffer);
    const entries = unzipped.getEntries();
    assert.equal(entries.length, 2);
    assert.equal(entries[0].entryName, "ReadMe.md");
    assert.equal(
      entries[0].getData().toString("utf8"),
      "This is a ReadMe file.",
    );
    assert.equal(entries[1].entryName, "sub/file.txt");
    assert.equal(
      entries[1].getData().toString("utf8"),
      "This is a text file in a subfolder.",
    );
  });

  test("reads a ZIP file", async () => {
    const fixturePath = new URL("fixtures/test.zip", import.meta.url);
    const buffer = await fs.readFile(fixturePath);
    const tree = await zip_handler.unpack(buffer);
    const plain = await Tree.plain(tree);
    assert.deepEqual(Object.keys(plain), ["ReadMe.md", "sub"]);
    assert.deepEqual(Object.keys(plain.sub), ["file.txt"]);
    assert.equal(String(plain["ReadMe.md"]), "This is a ReadMe file.\n");
    assert.equal(
      String(plain.sub["file.txt"]),
      "This is a text file in a subfolder.\n",
    );
  });
});
