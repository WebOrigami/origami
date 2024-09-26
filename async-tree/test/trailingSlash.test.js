import assert from "node:assert";
import { describe, test } from "node:test";
import { add, has, remove, toggle } from "../src/trailingSlash.js";

describe("trailingSlash", () => {
  test("add adds a trailing slash to a string key for a truthy value", () => {
    assert.equal(add("key"), "key/");
    assert.equal(add("key/"), "key/");
    assert.equal(add(1), 1);
  });

  test("has returns true if a string key has a trailing slash", () => {
    assert.equal(has("key/"), true);
    assert.equal(has("key"), false);
    assert.equal(has(1), false);
  });

  test("remove removes a trailing slash from a string key", () => {
    assert.equal(remove("key/"), "key");
    assert.equal(remove("key"), "key");
    assert.equal(remove(1), 1);
  });

  test("toggle removes a slash if present, adds one if not", () => {
    assert.equal(toggle("key/"), "key");
    assert.equal(toggle("key"), "key/");
    assert.equal(toggle(1), 1);
  });

  test("toggle can force toggling on or off", () => {
    assert.equal(toggle("key/", false), "key");
    assert.equal(toggle("key/", true), "key/");
    assert.equal(toggle("key", false), "key");
    assert.equal(toggle("key", true), "key/");
  });
});
