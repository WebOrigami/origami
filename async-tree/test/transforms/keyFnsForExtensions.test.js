import assert from "node:assert";
import { describe, test } from "node:test";
import ObjectTree from "../../src/ObjectTree.js";
import * as Tree from "../../src/Tree.js";
import keyFnsForExtensions from "../../src/transforms/keyFnsForExtensions.js";
import mapTransform from "../../src/transforms/mapTransform.js";

describe("keyFnsForExtensions", () => {
  test("returns key functions that pass a matching key through", async () => {
    const { innerKeyFn, keyFn } = keyFnsForExtensions({
      innerExtension: "txt",
    });
    assert.equal(await innerKeyFn("file.txt"), "file.txt");
    assert.equal(await keyFn(null, "file.txt"), "file.txt");
    assert.equal(await innerKeyFn("file.foo"), undefined);
    assert.equal(await keyFn(null, "file.foo"), undefined);
  });

  test("returns key functions that can map extensions", async () => {
    const { innerKeyFn, keyFn } = keyFnsForExtensions({
      extension: "html",
      innerExtension: "md",
    });
    assert.equal(await innerKeyFn("file.html"), "file.md");
    assert.equal(await keyFn(null, "file.md"), "file.html");
    assert.equal(await innerKeyFn("file.foo"), undefined);
    assert.equal(await keyFn(null, "file.foo"), undefined);
  });

  test("works with mapTransform to handle keys that end in a given extension", async () => {
    const files = new ObjectTree({
      "file1.txt": "will be mapped",
      file2: "won't be mapped",
      "file3.foo": "won't be mapped",
    });
    const { innerKeyFn, keyFn } = keyFnsForExtensions({
      innerExtension: "txt",
    });
    const transform = mapTransform({
      innerKeyFn,
      keyFn,
      valueFn: (innerValue, innerKey, tree) => innerValue.toUpperCase(),
    });
    const fixture = transform(files);
    assert.deepEqual(await Tree.plain(fixture), {
      "file1.txt": "WILL BE MAPPED",
    });
  });

  test("works with mapTransform to change a key's extension", async () => {
    const files = new ObjectTree({
      "file1.txt": "will be mapped",
      file2: "won't be mapped",
      "file3.foo": "won't be mapped",
    });
    const { innerKeyFn, keyFn } = keyFnsForExtensions({
      extension: "upper",
      innerExtension: "txt",
    });
    const transform = mapTransform({
      innerKeyFn,
      keyFn,
      valueFn: (innerValue, innerKey, tree) => innerValue.toUpperCase(),
    });
    const fixture = transform(files);
    assert.deepEqual(await Tree.plain(fixture), {
      "file1.upper": "WILL BE MAPPED",
    });
  });
});
