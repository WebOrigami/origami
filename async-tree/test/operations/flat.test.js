import assert from "node:assert";
import { describe, test } from "node:test";
import ObjectMap from "../../src/drivers/ObjectMap.js";
import flat from "../../src/operations/flat.js";
import plain from "../../src/operations/plain.js";

describe("flat", () => {
  test("flattens an array one level by default", async () => {
    const result = await flat([1, 2, [3], [[4, [5]]]], 1);
    assert.deepEqual(await plain(result), [1, 2, 3, [4, [5]]]);
  });

  test("flattens deep arrays", async () => {
    assert.deepEqual(
      await flat([1, 2, [3], [[4, [5]]]], Infinity),
      [1, 2, 3, 4, 5],
    );
  });

  test("flattens an object one level by default", async () => {
    const fixture = {
      a: 1,
      sub: {
        b: 2,
        more: {
          c: 3,
        },
      },
    };
    const result = await flat(fixture);
    assert.deepEqual(await plain(result), {
      a: 1,
      b: 2,
      more: {
        c: 3,
      },
    });
  });

  test("flattens deep objects", async () => {
    const fixture = {
      a: 1,
      sub: {
        b: 2,
        more: {
          c: 3,
        },
      },
    };
    const result = await flat(fixture, Infinity);
    assert.deepEqual(await plain(result), {
      a: 1,
      b: 2,
      c: 3,
    });
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
    assert.deepEqual(await plain(result), {
      a: 1,
      b: 2,
      c: 3,
      d: 4,
      0: 5,
      1: 6,
    });
  });
});
