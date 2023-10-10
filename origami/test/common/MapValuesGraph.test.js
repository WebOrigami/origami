import { Graph, ObjectGraph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import MapValuesGraph from "../../src/common/MapValuesGraph.js";

describe.only("MapValuesGraph", () => {
  test("applies a mapping function to values", async () => {
    const graph = new ObjectGraph({
      a: 1,
      b: 2,
      c: 3,
      more: {
        d: 4,
        e: 5,
      },
    });
    const doubled = new MapValuesGraph(graph, (value) => 2 * value, {
      deep: true,
    });
    const plain = await Graph.plain(doubled);
    assert.deepEqual(plain, {
      a: 2,
      b: 4,
      c: 6,
      more: {
        d: 8,
        e: 10,
      },
    });
  });

  test("can be told to not get values from the inner graph", async () => {
    let calledGet = false;
    class FixtureGraph extends ObjectGraph {
      async get(key) {
        if (key !== "more") {
          calledGet = true;
        }
        return super.get(key);
      }
    }
    const graph = new FixtureGraph({
      a: 1,
      b: 2,
      c: 3,
      more: {
        d: 4,
        e: 5,
      },
    });
    const mapped = new MapValuesGraph(graph, () => true, {
      deep: true,
      getValue: false,
    });
    assert.deepEqual(await Graph.plain(mapped), {
      a: true,
      b: true,
      c: true,
      more: {
        d: true,
        e: true,
      },
    });
    assert(!calledGet);
  });

  test("can define a custom name for the key in scope", async () => {
    const graph = new ObjectGraph({
      a: {
        b: "b",
      },
      c: {
        d: "d",
      },
    });
    async function innerFn(value) {
      const custom = await this.get("custom");
      return `${custom}${value}`;
    }
    /** @this {import("@graphorigami/types").AsyncDictionary} */
    async function outerFn(value) {
      const map = new MapValuesGraph(value, innerFn);
      /** @type {any} */ (map).parent = this;
      return map;
    }
    const outerMap = new MapValuesGraph(graph, outerFn, {
      keyName: "custom",
    });
    assert.deepEqual(await Graph.plain(outerMap), {
      a: {
        b: "ab",
      },
      c: {
        d: "cd",
      },
    });
  });
});
