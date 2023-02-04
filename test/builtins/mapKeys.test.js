import mapKeys from "../../src/builtins/mapKeys.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import * as ops from "../../src/language/ops.js";
import assert from "../assert.js";

describe("mapKeys", () => {
  it("by default makes the value itself the key", async () => {
    /** @type {any} */
    const graph = await mapKeys(["a", "b", "c"]);
    assert.deepEqual(await ExplorableGraph.plain(graph), {
      a: "a",
      b: "b",
      c: "c",
    });
  });

  it("can define a key from a value property", async () => {
    /** @type {any} */
    const graph = await mapKeys(
      [
        {
          id: "alice",
          name: "Alice",
        },
        {
          id: "bob",
          name: "Bob",
        },
        {
          id: "carol",
          name: "Carol",
        },
      ],
      (value) => value.get("id")
    );
    assert.deepEqual(await ExplorableGraph.plain(graph), {
      alice: {
        id: "alice",
        name: "Alice",
      },
      bob: {
        id: "bob",
        name: "Bob",
      },
      carol: {
        id: "carol",
        name: "Carol",
      },
    });
  });

  it("can define a key with a lambda", async () => {
    /** @type {any} */
    const graph = await mapKeys(
      [{ name: "Alice" }, { name: "Bob" }, { name: "Carol" }],
      ops.lambda([ops.scope, ".", "name"])
    );
    assert.deepEqual(await ExplorableGraph.plain(graph), {
      Alice: { name: "Alice" },
      Bob: { name: "Bob" },
      Carol: { name: "Carol" },
    });
  });
});
