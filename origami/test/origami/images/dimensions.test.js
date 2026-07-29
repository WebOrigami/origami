import assert from "node:assert";
import fs from "node:fs/promises";
import { describe, test } from "node:test";
import dimensions from "../../../src/origami/image/dimensions.js";

describe("dimensions", () => {
  test("returns height and width for an image", async () => {
    const fixturePath = new URL(
      "../fixtures/images/Portrait_1.jpg",
      import.meta.url,
    );
    const image = await fs.readFile(fixturePath);
    const result = await dimensions(image);
    assert.deepStrictEqual(result, { width: 1200, height: 1800 });
  });

  test("returns height and width for a rotated image", async () => {
    const fixturePath = new URL(
      "../fixtures/images/Portrait_5.jpg",
      import.meta.url,
    );
    const image = await fs.readFile(fixturePath);
    const result = await dimensions(image);
    assert.deepStrictEqual(result, { width: 1200, height: 1800 });
  });
});
