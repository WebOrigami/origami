import assert from "node:assert";
import { describe, test } from "node:test";
import DeepObjectMap from "../../src/drivers/DeepObjectMap.js";
import inners from "../../src/operations/inners.js";
import plain from "../../src/operations/plain.js";

describe("inners", () => {
  test("returns the interior nodes of a tree", async () => {
    const obj = new DeepObjectMap({
      a: 1,
      b: {
        c: 2,
        d: {
          e: 3,
        },
      },
      f: 4,
      g: {
        h: 5,
      },
    });
    const result = await inners(obj);
    assert.deepEqual(await plain(result), {
      b: {
        d: {},
      },
      g: {},
    });
  });
});
