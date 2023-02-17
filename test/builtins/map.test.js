import map from "../../src/builtins/map.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import assert from "../assert.js";

describe("map", () => {
  it("maps all the values in a graph", async () => {
    /** @type {any} */
    const fixture = map.call(
      null,
      {
        a: "Hello, a.",
        b: "Hello, b.",
        c: "Hello, c.",
      },
      (value) => value.toUpperCase()
    );
    assert.deepEqual(await ExplorableGraph.plain(fixture), {
      a: "HELLO, A.",
      b: "HELLO, B.",
      c: "HELLO, C.",
    });
  });

  it("maps subobjects as values by default", async () => {
    /** @type {any} */
    const fixture = map.call(
      null,
      {
        english: {
          a: "Hello, a.",
        },
        french: {
          a: "Bonjour, a.",
        },
      },
      async (value) => JSON.stringify(await ExplorableGraph.plain(value))
    );
    assert.deepEqual(await ExplorableGraph.plain(fixture), {
      english: '{"a":"Hello, a."}',
      french: '{"a":"Bonjour, a."}',
    });
  });

  it("setting deep option maps subobjects deeply", async () => {
    /** @type {any} */
    const fixture = map.call(
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
    assert.deepEqual(await ExplorableGraph.plain(fixture), {
      english: {
        a: "HELLO, A.",
      },
      french: {
        a: "BONJOUR, A.",
      },
    });
  });

  it("mapping function context includes the value's graph", async () => {
    /** @type {any} */
    const results = map.call(
      null,
      [{ name: "Alice" }, { name: "Bob" }, { name: "Carol" }],
      /** @this {any} */
      async function () {
        const name = await this.get("name");
        return name;
      },
      { addValueToScope: true }
    );
    assert.deepEqual(await ExplorableGraph.plain(results), [
      "Alice",
      "Bob",
      "Carol",
    ]);
  });

  it("extended map function includes @key and @value", async () => {
    /** @type {any} */
    const results = map.call(
      null,
      { a: 1, b: 2, c: 3 },
      /** @this {any} */
      async function () {
        const key = await this.get("@key");
        const value = await this.get("@value");
        return `${key}: ${value}`;
      }
    );
    assert.deepEqual(await ExplorableGraph.plain(results), {
      a: "a: 1",
      b: "b: 2",
      c: "c: 3",
    });
  });

  it("can specify how @key should be added to scope", async () => {
    /** @type {any} */
    const results = map.call(
      null,
      { a: 1, b: 2, c: 3 },
      /** @this {any} */
      async function () {
        return this.get("thing");
      },
      { keyName: "thing" }
    );
    assert.deepEqual(await ExplorableGraph.plain(results), {
      a: "a",
      b: "b",
      c: "c",
    });
  });
});
