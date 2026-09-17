import assert from "node:assert";
import { describe, test } from "node:test";
import plain from "../../src/operations/plain.js";
import withKeys from "../../src/operations/withKeys.js";
import SampleAsyncMap from "../SampleAsyncMap.js";

describe("withKeys", () => {
  test("applies the indicated keys to a sync map", async () => {
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

  test("applies the indicated keys to an async map", async () => {
    const result = withKeys(
      new SampleAsyncMap(
        Object.entries({
          a: 1,
          b: 2,
          c: 3,
        }),
      ),
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
