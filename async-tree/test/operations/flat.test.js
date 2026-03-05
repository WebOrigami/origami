import assert from "node:assert";
import { describe, test } from "node:test";
import ObjectMap from "../../src/drivers/ObjectMap.js";
import flat from "../../src/operations/flat.js";
import plain from "../../src/operations/plain.js";

describe("flat", () => {
  test("flattens the tree's values into an array", async () => {
    const fixture = {
      a: 1,
      sub: {
        b: 2,
        more: {
          c: 3,
        },
      },
    };
    assert.deepEqual(await flat(fixture, Infinity), [1, 2, 3]);
  });

  test("flattens one level by default", async () => {
    const fixture = {
      a: 1,
      sub: {
        b: 2,
        more: {
          c: 3,
        },
      },
    };
    assert.deepEqual(await plain(await flat(fixture)), [
      1,
      { b: 2, more: { c: 3 } },
    ]);
  });

  test("flattens arrays", async () => {
    assert.deepEqual(await flat([1, 2, [3]], Infinity), [1, 2, 3]);
  });

  test("flattens maplike objects", async () => {
    const result = await flat(
      [
        {
          a: 1,
          b: 2,
        },
        new ObjectMap({
          c: 3,
          d: 4,
        }),
        [5, 6],
      ],
      Infinity,
    );
    assert.deepEqual(result, [1, 2, 3, 4, 5, 6]);
  });
});
