import assert from "node:assert";
import { describe, test } from "node:test";
import AsyncMap from "../../src/drivers/AsyncMap.js";

describe("AsyncMap", () => {
  test("instanceof returns true for both Map and AsyncMap", () => {
    assert(new Map() instanceof AsyncMap);
    assert(new AsyncMap() instanceof AsyncMap);
    assert(!(new Object() instanceof AsyncMap));
  });
});
