import assert from "node:assert";
import { describe, test } from "node:test";
import unpackArguments from "../../src/runtime/unpackArguments.js";

describe("unpackArguments", () => {
  test("unpacks top-level arguments", async () => {
    const a = "a";
    const b = new Uint8Array();
    /** @type {any} */ (b).unpack = function () {
      return "b unpacked";
    };
    const c = "string";
    const result = await unpackArguments(a, b, c);
    assert.deepEqual(result, ["a", "b unpacked", c]);
  });

  test("unpacks top-level keys of plain object arguments", async () => {
    const key2 = new Uint8Array();
    /** @type {any} */ (key2).unpack = function () {
      return "key2 unpacked";
    };
    const obj = {
      key1: "key1",
      key2,
      key3: "key3",
    };
    const result = await unpackArguments(obj);
    assert.deepEqual(result, [
      {
        key1: "key1",
        key2: "key2 unpacked",
        key3: "key3",
      },
    ]);
  });
});
