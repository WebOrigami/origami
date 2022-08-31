import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ObjectGraph from "../../src/core/ObjectGraph.js";
import KeysTransform from "../../src/framework/KeysTransform.js";
import assert from "../assert.js";

describe("KeysTransform", () => {
  it("real and virtual keys can imply additional virtual keys", async () => {
    class FixtureGraph extends KeysTransform(ObjectGraph) {
      async keyAdded(key, existingKeys) {
        if (key === "a") {
          this.addKey("b");
        } else if (key === "b") {
          this.addKey("c");
        }
      }
    }
    const graph = new FixtureGraph({
      a: "",
    });
    const keys = await ExplorableGraph.keys(graph);
    assert.deepEqual(keys, ["a", "b", "c"]);
    assert.deepEqual(await graph.allKeys(), ["a", "b", "c"]);
    assert.deepEqual(await graph.publicKeys(), ["a", "b", "c"]);
    assert.deepEqual(await graph.realKeys(), ["a"]);
  });

  it("keys can be hidden", async () => {
    class FixtureGraph extends KeysTransform(ObjectGraph) {
      async keyAdded(key, existingKeys) {
        if (key.startsWith(".")) {
          return { hidden: true };
        }
        return;
      }
    }
    const graph = new FixtureGraph({
      ".foo": "",
      bar: "",
    });
    const keys = await ExplorableGraph.keys(graph);
    assert.deepEqual(keys, ["bar"]);
    assert.deepEqual(await graph.allKeys(), [".foo", "bar"]);
    assert.deepEqual(await graph.publicKeys(), ["bar"]);
    assert.deepEqual(await graph.realKeys(), [".foo", "bar"]);
  });

  it("keys can be implied", async () => {
    class FixtureGraph extends KeysTransform(ObjectGraph) {
      async keysAdded(keys) {
        // Every .foo key implies a .bar key
        for (const key of keys) {
          if (key.endsWith(".foo")) {
            this.addKey(`${key.slice(0, -4)}.bar`);
          }
        }
      }
    }
    const graph = new FixtureGraph({
      "a.foo": "",
      "b.txt": "",
      "c.foo": "",
    });
    const keys = await ExplorableGraph.keys(graph);
    assert.deepEqual(keys, ["a.bar", "a.foo", "b.txt", "c.bar", "c.foo"]);
  });
});
