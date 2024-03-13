import { FileTree } from "@weborigami/async-tree";
import { ImportModulesMixin } from "@weborigami/language";
import assert from "node:assert";
import { describe, test } from "node:test";
import fileTypeWasm from "../../../src/builtins/@loaders/wasm.js";

const fixturesUrl = new URL("fixtures", import.meta.url);
const fixturesTree = new (ImportModulesMixin(FileTree))(fixturesUrl);

describe(".wasm loader", () => {
  test("loads .wasm file that exports a function", async () => {
    const buffer = await fixturesTree.get("add.wasm");
    const { add } = await fileTypeWasm.unpack(buffer, {
      key: "add.wasm",
      parent: fixturesTree,
    });
    const sum = add(1, 2);
    assert.strictEqual(sum, 3);
  });
});
