import { ObjectTree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import fileTypeOrigamiDocument from "../../../src/builtins/ori_document_handler.js";

describe("Origami document handler", () => {
  test("unpacks text with Origami expressions", async () => {
    const parent = new ObjectTree({
      name: "world",
    });
    const key = "test.ori.txt";
    const text = "Hello, ${ name }!";
    const fn = await fileTypeOrigamiDocument.unpack(text, { key, parent });
    const result = await fn();
    assert.equal(result, "Hello, world!");

    // Test sidecar keyFn
    const keyFn = fn.keyFn;
    assert.equal(keyFn("data.json"), "data.txt");
  });
});
