import assert from "node:assert";
import { describe, test } from "node:test";
import { DeepObjectMap } from "../../index.ts";
import ObjectTree from "../../src/drivers/ObjectTree.js";
import from from "../../src/operations/from.js";
import plain from "../../src/operations/plain.js";
import * as symbols from "../../src/symbols.js";

describe("from", () => {
  test("returns an async tree as is", async () => {
    const tree1 = new ObjectTree({
      a: "Hello, a.",
    });
    const tree2 = from(tree1);
    assert.equal(tree2, tree1);
  });

  test("uses an object's unpack() method if defined", async () => {
    const obj = new String();
    /** @type {any} */ (obj).unpack = () => ({
      a: "Hello, a.",
    });
    const tree = from(obj);
    assert.deepEqual(await plain(tree), {
      a: "Hello, a.",
    });
  });

  test("returns a deep object map if deep option is true", async () => {
    const obj = {
      sub: {
        a: 1,
      },
    };
    const tree = from(obj, { deep: true });
    assert(tree instanceof DeepObjectMap);
  });

  test("returns a deep object map if object has [deep] symbol set", async () => {
    const obj = {
      sub: {
        a: 1,
      },
    };
    Object.defineProperty(obj, symbols.deep, { value: true });
    const tree = from(obj);
    assert(tree instanceof DeepObjectMap);
  });

  test("creates a deferred tree if unpack() returns a promise", async () => {
    const obj = new String();
    /** @type {any} */ (obj).unpack = async () => ({
      a: "Hello, a.",
    });
    const tree = from(obj);
    assert.deepEqual(await plain(tree), {
      a: "Hello, a.",
    });
  });

  test("autoboxes primitive values", async () => {
    const tree = from("Hello, world.");
    const slice = await tree.get("slice");
    const result = await slice(0, 5);
    assert.equal(result, "Hello");
  });
});
