import assert from "node:assert";
import { describe, test } from "node:test";
import AsyncMap from "../../src/drivers/AsyncMap.js";
import isMap from "../../src/operations/isMap.js";

describe("isMap", () => {
  test("returns true if the object is a Map or AsyncMap", () => {
    assert(!isMap(null));
    assert(!isMap(1));
    assert(!isMap({}));
    assert(!isMap([]));
    assert(isMap(new Map()));
    assert(isMap(new AsyncMap()));
  });
});
