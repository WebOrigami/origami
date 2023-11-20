import assert from "node:assert";
import { describe, test } from "node:test";
import ObjectTree from "../../src/ObjectTree.js";
import * as Tree from "../../src/Tree.js";
import keyMapsForExtensions from "../../src/transforms/keyMapsForExtensions.js";
import map from "../../src/transforms/map.js";

describe("keyMapsForExtensions", () => {
  test("returns key functions that pass a matching key through", async () => {
    const { inverseKeyMap, keyMap } = keyMapsForExtensions({
      sourceExtension: "txt",
    });
    assert.equal(await inverseKeyMap("file.txt"), "file.txt");
    assert.equal(await keyMap("file.txt"), "file.txt");
    assert.equal(await inverseKeyMap("file.foo"), undefined);
    assert.equal(await keyMap("file.foo"), undefined);
  });

  test("returns key functions that can map extensions", async () => {
    const { inverseKeyMap, keyMap } = keyMapsForExtensions({
      resultExtension: "html",
      sourceExtension: "md",
    });
    assert.equal(await inverseKeyMap("file.html"), "file.md");
    assert.equal(await keyMap("file.md"), "file.html");
    assert.equal(await inverseKeyMap("file.foo"), undefined);
    assert.equal(await keyMap("file.foo"), undefined);
  });

  test("works with map to handle keys that end in a given resultExtension", async () => {
    const files = new ObjectTree({
      "file1.txt": "will be mapped",
      file2: "won't be mapped",
      "file3.foo": "won't be mapped",
    });
    const { inverseKeyMap, keyMap } = keyMapsForExtensions({
      sourceExtension: "txt",
    });
    const transform = map({
      inverseKeyMap,
      keyMap,
      valueMap: (sourceValue, sourceKey, tree) => sourceValue.toUpperCase(),
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
    const { inverseKeyMap, keyMap } = keyMapsForExtensions({
      resultExtension: "upper",
      sourceExtension: "txt",
    });
    const transform = map({
      inverseKeyMap,
      keyMap,
      valueMap: (sourceValue, sourceKey, tree) => sourceValue.toUpperCase(),
    });
    const fixture = transform(files);
    assert.deepEqual(await Tree.plain(fixture), {
      "file1.upper": "WILL BE MAPPED",
    });
  });
});
