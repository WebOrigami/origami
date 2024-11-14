import { ObjectTree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import inherited from "../../src/protocols/inherited.js";

describe("inherited", () => {
  test("searches inherited scope", async () => {
    const parent = new ObjectTree({
      a: 1, // This is the inherited value we want
    });
    /** @type {any} */
    const child = new ObjectTree({
      a: 2, // Should be ignored
    });
    child.parent = parent;
    const result = await inherited.call(child, "a");
    assert.equal(result, 1);
  });
});
