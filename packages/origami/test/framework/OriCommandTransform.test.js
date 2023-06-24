import { ObjectGraph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import builtins from "../../src/builtins/@builtins.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import OriCommandTransform from "../../src/framework/OriCommandTransform.js";

describe("OriCommandTransform", () => {
  test("prefers value defined by base graph even if it starts with '!'", async () => {
    const graph = new (OriCommandTransform(ObjectGraph))({
      "!yaml": "foo",
    });
    const value = await graph.get("!yaml");
    assert.equal(value, "foo");
  });

  test("evaluates an Origami expression in the graph's scope", async () => {
    const graph = new (OriCommandTransform(ObjectGraph))({
      a: 1,
      b: 2,
    });
    /** @type {any} */ (graph).scope = builtins;
    const value = await graph.get("!@graph/keys");
    assert.deepEqual(await ExplorableGraph.plain(value), ["a", "b"]);
  });
});
