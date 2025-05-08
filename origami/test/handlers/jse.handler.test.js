import { ObjectTree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import { jseHandler } from "../../src/internal.js";

describe("JSE handler", () => {
  test("local references that don't match locally throw", async () => {
    const parent = new ObjectTree({
      name: "world",
    });
    const text = "(name) => `Hello, ${ name }!`";
    const fn = await jseHandler.unpack(text, {
      key: "test.ori.txt",
      parent,
    });
    assert.rejects(
      async () => {
        await fn();
      },
      {
        name: "ReferenceError",
        message: "Not found: name",
      }
    );
  });
});
