import assert from "node:assert";
import { describe, test } from "node:test";
import plain from "../../src/operations/plain.js";
import withKeys from "../../src/operations/withKeys.js";

describe("withKeys", () => {
  test("applies the indicated keys", async () => {
    const result = withKeys(
      {
        a: 1,
        b: 2,
        c: 3,
      },
      ["a", "c"],
    );
    assert.deepEqual(await plain(result), {
      a: 1,
      c: 3,
    });
  });

  test("accepts a sync keys generator", async () => {
    function* keysGen() {
      yield "a";
      yield "c";
    }
    const result = withKeys(
      {
        a: 1,
        b: 2,
        c: 3,
      },
      keysGen,
    );
    assert.deepEqual(await plain(result), {
      a: 1,
      c: 3,
    });
  });

  test("accepts an async keys generator", async () => {
    async function* keysGen() {
      yield "a";
      yield "c";
    }
    const result = withKeys(
      {
        a: 1,
        b: 2,
        c: 3,
      },
      keysGen,
    );
    assert.deepEqual(await plain(result), {
      a: 1,
      c: 3,
    });
  });
});
