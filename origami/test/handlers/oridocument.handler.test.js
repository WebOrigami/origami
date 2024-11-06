import { ObjectTree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import { oridocumentHandler } from "../../src/builtins/internal.js";

describe("Origami document handler", () => {
  test("unpacks text with Origami expressions", async () => {
    const parent = new ObjectTree({
      name: "world",
    });
    const text = "Hello, ${ name }!";
    const fn = await oridocumentHandler.unpack(text, { parent });
    const result = await fn();
    assert.equal(result, "Hello, world!");
  });
});
