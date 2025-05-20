import { ObjectTree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import { jseHandler } from "../../src/handlers/handlers.js";

describe("JSE handler", () => {
  test("local a function", async () => {
    const parent = new ObjectTree({
      name: "world",
    });
    const text = "() => `Hello, ${ <name> }!`";
    const fn = await jseHandler.unpack(text, {
      key: "test.jse",
      parent,
    });
    const result = await fn();
    assert.equal(result, "Hello, world!");
  });
});
