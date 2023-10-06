import { Graph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import mapKeys from "../../../src/builtins/@map/keys.js";
import * as ops from "../../../src/language/ops.js";

describe("@map/keys", () => {
  test("can define a key from a value property", async () => {
    /** @type {any} */
    const graph = await mapKeys.call(
      null,
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
    assert.deepEqual(await Graph.plain(graph), {
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

  test("can define a key with a lambda", async () => {
    /** @type {any} */
    const graph = await mapKeys.call(
      null,
      [{ name: "Alice" }, { name: "Bob" }, { name: "Carol" }],
      ops.lambda.call(null, [ops.scope, "_", "name"])
    );
    assert.deepEqual(await Graph.plain(graph), {
      Alice: { name: "Alice" },
      Bob: { name: "Bob" },
      Carol: { name: "Carol" },
    });
  });
});
