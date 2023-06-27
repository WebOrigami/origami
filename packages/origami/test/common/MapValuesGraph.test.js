import { GraphHelpers, ObjectGraph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import MapValuesGraph from "../../src/common/MapValuesGraph.js";

describe("MapValuesGraph", () => {
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
    const plain = await GraphHelpers.plain(doubled);
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
    assert.deepEqual(await GraphHelpers.plain(mapped), {
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
});
