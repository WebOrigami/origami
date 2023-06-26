import { GraphHelpers } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import reverse from "../../../src/builtins/@graph/reverse.js";

describe("@graph/reverse", () => {
  test("reverses a graph's top-level keys", async () => {
    const graph = {
      a: "A",
      b: "B",
      c: "C",
    };
    const reversed = await reverse.call(null, graph);
    // @ts-ignore
    assert.deepEqual(Array.from(await reversed.keys()), ["c", "b", "a"]);
    // @ts-ignore
    assert.deepEqual(await GraphHelpers.plain(reversed), {
      c: "C",
      b: "B",
      a: "A",
    });
  });
});
