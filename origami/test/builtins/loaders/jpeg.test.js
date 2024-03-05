import assert from "node:assert";
import fs from "node:fs/promises";
import { describe, test } from "node:test";
import unpackJpeg from "../../../src/builtins/@loaders/jpeg.js";

describe(".jpeg loader", () => {
  test("loads Exif metadata", async () => {
    const fixturePath = new URL("fixtures/exif.jpeg", import.meta.url);
    const image = await fs.readFile(fixturePath);
    const data = await unpackJpeg(image);
    assert.equal(data.exif.LensMake, "Apple");
    assert.equal(
      data.exif.ModifyDate.toISOString(),
      "2023-11-13T18:44:11.000Z"
    );
    assert.equal(data.exif.Orientation, 1);
  });
});
