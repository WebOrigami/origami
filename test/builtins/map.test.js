import map from "../../src/builtins/map.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import assert from "../assert.js";

describe("map", () => {
  it("maps all the values in a graph", async () => {
    const fixture = map(
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

  it("applies a mapping function to convert designated file extensions", async () => {
    const fixture = map(
      {
        "file1.txt": "will be mapped",
        file2: "won't be mapped",
        "file3.foo": "won't be mapped",
      },
      (value) => value.toUpperCase(),
      ".txt",
      ".upper"
    );
    assert.deepEqual(await ExplorableGraph.plain(fixture), {
      "file1.upper": "WILL BE MAPPED",
      file2: "won't be mapped",
      "file3.foo": "won't be mapped",
    });
  });

  it("mapping function context's scope has @key and @value ambient properties", async () => {
    const results = map(
      ["a", "b", "c"],
      /** @this {any} */
      async function () {
        const key = await this.scope.get("@key");
        const value = await this.scope.get("@value");
        return { key, value };
      }
    );
    assert.deepEqual(await ExplorableGraph.plain(results), {
      0: { key: 0, value: "a" },
      1: { key: 1, value: "b" },
      2: { key: 2, value: "c" },
    });
  });

  it("mapping function context's scope includes the value's graph", async () => {
    const results = map(
      [{ name: "Alice" }, { name: "Bob" }, { name: "Carol " }],
      /** @this {any} */
      async function () {
        const name = await this.scope.get("name");
        return name;
      }
    );
    assert.deepEqual(await ExplorableGraph.plain(results), {
      0: "Alice",
      1: "Bob",
      2: "Carol ",
    });
  });
});
