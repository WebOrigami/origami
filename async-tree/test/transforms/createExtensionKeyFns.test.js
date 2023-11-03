import assert from "node:assert";
import { describe, test } from "node:test";
import createExtensionKeyFns from "../../src/transforms/createExtensionKeyFns.js";

describe("createExtensionKeyFns", () => {
  test("returns key functions that pass a matching key through", async () => {
    const { innerKeyFn, keyFn } = createExtensionKeyFns({
      innerExtension: "txt",
    });
    assert.equal(await innerKeyFn("file.txt"), "file.txt");
    assert.equal(await keyFn("file.txt"), "file.txt");
    assert.equal(await innerKeyFn("file.foo"), undefined);
    assert.equal(await keyFn("file.foo"), undefined);
  });

  test("returns key functions that can map extensions", async () => {
    const { innerKeyFn, keyFn } = createExtensionKeyFns({
      extension: "html",
      innerExtension: "md",
    });
    assert.equal(await innerKeyFn("file.html"), "file.md");
    assert.equal(await keyFn("file.md"), "file.html");
    assert.equal(await innerKeyFn("file.foo"), undefined);
    assert.equal(await keyFn("file.foo"), undefined);
  });
});
