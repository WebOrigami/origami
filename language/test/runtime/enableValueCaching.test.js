import assert from "node:assert";
import { beforeEach, describe, test } from "node:test";
import enableValueCaching from "../../src/runtime/enableValueCaching.js";
import { cachePathSymbol } from "../../src/runtime/symbols.js";
import systemCache from "../../src/runtime/systemCache.js";

describe("enableValueCaching", () => {
  beforeEach(() => {
    systemCache.clear();
  });

  test("leaves primitive values as is", () => {
    const value1 = enableValueCaching(1, "foo.ori/");
    assert.equal(value1, 1);

    const value2 = enableValueCaching("hello", "foo.ori/");
    assert.equal(value2, "hello");
  });

  test("adds cachePath to plain object", () => {
    const obj = { a: 1, b: 2 };
    const value = enableValueCaching(obj, "foo.ori/");
    assert.equal(value, obj);
    assert.equal(value[cachePathSymbol], "foo.ori/");
  });

  test("adds cachePath to array", () => {
    const arr = [1, 2, 3];
    const value = enableValueCaching(arr, "foo.ori/");
    assert.equal(value, arr);
    assert.equal(value[cachePathSymbol], "foo.ori/");
  });

  test("applies cache transform to Map", () => {
    const map = new Map([
      ["a", 1],
      ["b", 2],
    ]);
    const value = enableValueCaching(map, "foo.ori/");
    assert(value instanceof Map);
    assert.equal(value[cachePathSymbol], "foo.ori/");
    assert.equal(value.get("a"), 1);
    assert(systemCache.has("foo.ori/a"));
  });

  test("applies cache to function", () => {
    function greet(name) {
      return `Hello, ${name}!`;
    }
    const value = enableValueCaching(greet, "foo.ori/");
    assert(typeof value === "function");
    assert.equal(value("world"), "Hello, world!");
    assert.equal(value[cachePathSymbol], "foo.ori/");
  });
});
