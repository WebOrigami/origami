import assert from "node:assert";
import { describe, test } from "node:test";
import ObjectMap from "../../src/drivers/ObjectMap.js";
import concat from "../../src/operations/concat.js";

describe("concat", () => {
  test("concatenates arrays", async () => {
    const result = await concat(["a", "b"], ["c", "d"]);
    assert.deepEqual(result, ["a", "b", "c", "d"]);
  });

  test("concatenates maplike objects", async () => {
    const result = await concat(
      {
        1: "a",
        2: "b",
      },
      new ObjectMap({
        0: "c",
        1: "d",
      }),
      ["e", "f"],
    );
    assert.deepEqual(result, ["a", "b", "c", "d", "e", "f"]);
  });

  test("copes with mixture of numeric and non-numeric keys", async () => {
    const result = await concat(
      ["a", "b"],
      {
        x: 1,
        y: 2,
      },
      ["c", "d"],
    );
    assert.deepEqual(
      [...result.entries()],
      [
        ["0", "a"],
        ["1", "b"],
        ["x", 1],
        ["y", 2],
        ["2", "c"],
        ["3", "d"],
      ],
    );
  });

  test("can unpack arguments", async () => {
    /** @type {any} */
    const packed1 = new String("Packed array");
    packed1.unpack = async function () {
      return ["a", "b"];
    };
    /** @type {any} */
    const packed2 = new String("Packed object");
    packed2.unpack = async function () {
      return {
        0: "c",
        1: "d",
      };
    };
    const result = await concat(packed1, packed2);
    assert.deepEqual(result, ["a", "b", "c", "d"]);
  });
});
