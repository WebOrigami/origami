import assert from "node:assert";
import { describe, test } from "node:test";
import combine from "../../src/operations/combine.js";
import plain from "../../src/operations/plain.js";

describe("combine", () => {
  test("combines two trees", async () => {
    const oldTree = {
      a: {
        b: "old",
        c: "old",
        d: "old",
      },
    };
    const newTree = {
      a: {
        b: "new",
        c: "old",
      },
      e: "new",
    };

    function compare(a, b) {
      return [a, b];
    }

    const combined = await combine(oldTree, newTree, compare);
    assert(combined);
    assert.deepEqual(await plain(combined), {
      a: {
        b: ["old", "new"],
        c: ["old", "old"],
        d: ["old", undefined],
      },
      e: [undefined, "new"],
    });
  });

  test("includeUndefined", async () => {
    const oldTree = {
      a: 1,
      b: 2,
      c: undefined,
    };
    const newTree = {
      a: 10,
      b: undefined,
      c: 30,
    };

    function compare(a, b) {
      return a !== undefined && b !== undefined ? a + b : undefined;
    }

    const combined = await combine(oldTree, newTree, {
      compare,
      includeUndefined: true,
    });
    assert(combined);
    assert.deepEqual(await plain(combined), {
      a: 11,
      b: undefined,
      c: undefined,
    });
  });
});
