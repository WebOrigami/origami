import assert from "node:assert";
import { describe, test } from "node:test";
import DeepObjectMap from "../../src/drivers/DeepObjectMap.js";
import deepMerge from "../../src/operations/deepMerge.js";
import plain from "../../src/operations/plain.js";

describe("mergeDeep", () => {
  test("can merge deep", async () => {
    const fixture = deepMerge(
      new DeepObjectMap({
        a: {
          b: 0, // Will be obscured by `b` below
          c: {
            d: 2,
          },
        },
      }),
      new DeepObjectMap({
        a: {
          b: 1,
          c: {
            e: 3,
          },
          f: 4,
        },
      })
    );
    assert.deepEqual(await plain(fixture), {
      a: {
        b: 1,
        c: {
          d: 2,
          e: 3,
        },
        f: 4,
      },
    });
  });
});
