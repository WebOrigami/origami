import map from "../../src/builtins/map.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import assert from "../assert.js";

describe("map", () => {
  it("mapping function context includes the value's graph", async () => {
    /** @type {any} */
    const results = map(
      [{ name: "Alice" }, { name: "Bob" }, { name: "Carol" }],
      /** @this {any} */
      async function () {
        const name = await this.get("name");
        return name;
      }
    );
    assert.deepEqual(await ExplorableGraph.plain(results), [
      "Alice",
      "Bob",
      "Carol",
    ]);
  });

  it("extended map function includes @key and @value", async () => {
    /** @type {any} */
    const results = map(
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
    const results = map(
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
