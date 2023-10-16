import { Tree } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import mapValues from "../../../src/builtins/@map/values.js";

describe("map", () => {
  test("maps all the values in a tree", async () => {
    /** @type {any} */
    const fixture = mapValues.call(
      null,
      {
        a: "Hello, a.",
        b: "Hello, b.",
        c: "Hello, c.",
      },
      (value) => value.toUpperCase()
    );
    assert.deepEqual(await Tree.plain(fixture), {
      a: "HELLO, A.",
      b: "HELLO, B.",
      c: "HELLO, C.",
    });
  });

  test("maps subobjects as values by default", async () => {
    /** @type {any} */
    const fixture = mapValues.call(
      null,
      {
        english: {
          a: "Hello, a.",
        },
        french: {
          a: "Bonjour, a.",
        },
      },
      async (value) => JSON.stringify(await Tree.plain(value))
    );
    assert.deepEqual(await Tree.plain(fixture), {
      english: '{"a":"Hello, a."}',
      french: '{"a":"Bonjour, a."}',
    });
  });

  test("setting deep option maps subobjects deeply", async () => {
    /** @type {any} */
    const fixture = mapValues.call(
      null,
      {
        english: {
          a: "Hello, a.",
        },
        french: {
          a: "Bonjour, a.",
        },
      },
      (value) => value.toUpperCase(),
      { deep: true }
    );
    assert.deepEqual(await Tree.plain(fixture), {
      english: {
        a: "HELLO, A.",
      },
      french: {
        a: "BONJOUR, A.",
      },
    });
  });

  test("extended map function includes @key and _", async () => {
    /** @type {any} */
    const results = mapValues.call(
      null,
      { a: 1, b: 2, c: 3 },
      /** @this {any} */
      async function () {
        const key = await this.get("@key");
        const value = await this.get("_");
        return `${key}: ${value}`;
      }
    );
    assert.deepEqual(await Tree.plain(results), {
      a: "a: 1",
      b: "b: 2",
      c: "c: 3",
    });
  });

  test("can specify how @key should be added to scope", async () => {
    /** @type {any} */
    const results = mapValues.call(
      null,
      { a: 1, b: 2, c: 3 },
      /** @this {any} */
      async function () {
        return this.get("thing");
      },
      { keyName: "thing" }
    );
    assert.deepEqual(await Tree.plain(results), {
      a: "a",
      b: "b",
      c: "c",
    });
  });

  test("can map to a constant value", async () => {
    /** @type {any} */
    const results = mapValues.call(
      null,
      { a: 1, b: 2, c: 3 },
      () => "constant"
    );
    assert.deepEqual(await Tree.plain(results), {
      a: "constant",
      b: "constant",
      c: "constant",
    });
  });
});
