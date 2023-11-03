import { ObjectTree, Tree } from "@graphorigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import extensionTransform from "../../src/transforms/extensionTransform.js";

describe("extensionTransform", () => {
  test("applies a mapping function to keys that end in a given extension", async () => {
    const files = new ObjectTree({
      "file1.txt": "will be mapped",
      file2: "won't be mapped",
      "file3.foo": "won't be mapped",
    });
    const transform = extensionTransform({
      innerExtension: "txt",
      valueFn: (value) => value.toUpperCase(),
    });
    const fixture = transform(files);
    assert.deepEqual(await Tree.plain(fixture), {
      "file1.txt": "WILL BE MAPPED",
    });
  });

  test("can change a key's extension", async () => {
    const files = new ObjectTree({
      "file1.txt": "will be mapped",
      file2: "won't be mapped",
      "file3.foo": "won't be mapped",
    });
    const transform = extensionTransform({
      extension: "upper",
      innerExtension: "txt",
      valueFn: (value) => value.toUpperCase(),
    });
    const fixture = transform(files);
    assert.deepEqual(await Tree.plain(fixture), {
      "file1.upper": "WILL BE MAPPED",
    });
  });

  test("can map deeply", async () => {
    const files = new ObjectTree({
      "file1.txt": "will be mapped",
      file2: "won't be mapped",
      "file3.foo": "won't be mapped",
      more: {
        "file4.txt": "will be mapped",
        "file5.bar": "won't be mapped",
      },
    });
    const transform = extensionTransform({
      deep: true,
      extension: "upper",
      innerExtension: "txt",
      valueFn: (value) => value.toUpperCase(),
    });
    const fixture = transform(files);
    assert.deepEqual(await Tree.plain(fixture), {
      "file1.upper": "WILL BE MAPPED",
      more: {
        "file4.upper": "WILL BE MAPPED",
      },
    });
  });
});
