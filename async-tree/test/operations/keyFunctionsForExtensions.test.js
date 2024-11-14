import assert from "node:assert";
import { describe, test } from "node:test";
import { ObjectTree, Tree } from "../../src/internal.js";
import keyFunctionsForExtensions from "../../src/operations/keyFunctionsForExtensions.js";
import map from "../../src/operations/mapFn.js";

describe("keyMapsForExtensions", () => {
  test("returns key functions that pass a matching key through", async () => {
    const { inverseKey, key } = keyFunctionsForExtensions({
      sourceExtension: "txt",
    });
    assert.equal(await inverseKey("file.txt"), "file.txt");
    assert.equal(await inverseKey("file.txt/"), "file.txt");
    assert.equal(await key("file.txt"), "file.txt");
    assert.equal(await key("file.txt/"), "file.txt/");
    assert.equal(await inverseKey("file.foo"), undefined);
    assert.equal(await key("file.foo"), undefined);
  });

  test("returns key functions that can map extensions", async () => {
    const { inverseKey, key } = keyFunctionsForExtensions({
      resultExtension: "json",
      sourceExtension: "md",
    });
    assert.equal(await inverseKey("file.json"), "file.md");
    assert.equal(await inverseKey("file.json/"), "file.md");
    assert.equal(await key("file.md"), "file.json");
    assert.equal(await key("file.md/"), "file.json/");
    assert.equal(await inverseKey("file.foo"), undefined);
    assert.equal(await key("file.foo"), undefined);
  });

  test("works with map to handle keys that end in a given resultExtension", async () => {
    const files = new ObjectTree({
      "file1.txt": "will be mapped",
      file2: "won't be mapped",
      "file3.foo": "won't be mapped",
    });
    const { inverseKey, key } = keyFunctionsForExtensions({
      sourceExtension: "txt",
    });
    const transform = map({
      inverseKey,
      key,
      value: (sourceValue, sourceKey, tree) => sourceValue.toUpperCase(),
    });
    const fixture = transform(files);
    assert.deepEqual(await Tree.plain(fixture), {
      "file1.txt": "WILL BE MAPPED",
    });
  });

  test("works with map to change a key's resultExtension", async () => {
    const files = new ObjectTree({
      "file1.txt": "will be mapped",
      file2: "won't be mapped",
      "file3.foo": "won't be mapped",
    });
    const { inverseKey, key } = keyFunctionsForExtensions({
      resultExtension: "upper",
      sourceExtension: "txt",
    });
    const transform = map({
      inverseKey,
      key,
      value: (sourceValue, sourceKey, tree) => sourceValue.toUpperCase(),
    });
    const fixture = transform(files);
    assert.deepEqual(await Tree.plain(fixture), {
      "file1.upper": "WILL BE MAPPED",
    });
  });
});
