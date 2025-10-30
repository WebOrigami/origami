import assert from "node:assert";
import { describe, test } from "node:test";
import mapExtension from "../../src/operations/mapExtension.js";
import plain from "../../src/operations/plain.js";

describe("mapExtension", () => {
  test("can add an extension to a key", async () => {
    const maplike = {
      "file0.txt": 1,
      file1: 2,
      file2: 3,
    };
    const fixture = await mapExtension(maplike, "->.data");
    assert.deepEqual(await plain(fixture), {
      "file0.txt.data": 1,
      "file1.data": 2,
      "file2.data": 3,
    });
  });

  test("can change a key's extension", async () => {
    const maplike = {
      "file1.lower": "will be mapped",
      file2: "won't be mapped",
      "file3.foo": "won't be mapped",
    };
    const fixture = await mapExtension(maplike, {
      extension: ".lower->.upper",
      value: (sourceValue) => sourceValue.toUpperCase(),
    });
    assert.deepEqual(await plain(fixture), {
      "file1.upper": "WILL BE MAPPED",
    });
  });

  test("can manipulate extensions deeply", async () => {
    const maplike = {
      "file1.txt": 1,
      more: {
        "file2.txt": 2,
      },
    };
    const fixture = await mapExtension(maplike, ".txt->", {
      deep: true,
    });
    assert.deepEqual(await plain(fixture), {
      file1: 1,
      more: {
        file2: 2,
      },
    });
  });
});
