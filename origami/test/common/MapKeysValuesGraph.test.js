import { FunctionGraph, Graph, ObjectGraph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import MapKeysValuesGraph from "../../src/common/MapKeysValuesGraph.js";

// Test graph changes a lowercase inner key and its value to uppercase, but
// leaves uppercase inner keys and their values alone.
class UppercaseKeysGraph extends MapKeysValuesGraph {
  async innerKeyForOuterKey(outerKey) {
    return outerKey.toLowerCase();
  }

  async mapApplies(innerValue, outerKey, innerKey) {
    const base = await super.mapApplies(innerValue, outerKey, innerKey);
    return base;
  }

  async outerKeyForInnerKey(innerKey) {
    return innerKey.toUpperCase();
  }
}

describe("MapKeysValuesTest", () => {
  test("maps keys and values", async () => {
    const inner = {
      a: "hello, a.",
      // This manually-specified uppercase key should be used directly.
      B: "Goodbye, B.",
      c: "goodnight, c.",
    };
    const outer = new UppercaseKeysGraph(
      inner,
      (value) => value.toUpperCase(),
      {
        preferExistingValue: true,
      }
    );
    assert.deepEqual(await Graph.plain(outer), {
      A: "HELLO, A.",
      B: "Goodbye, B.",
      C: "GOODNIGHT, C.",
    });
  });

  test("can be told to not get values from the inner graph", async () => {
    let calledGet = false;
    const domain = ["a", "b", "c"];
    const inner = new FunctionGraph((key) => {
      if (domain.includes(key)) {
        calledGet = true;
        return false;
      }
      return undefined;
    }, domain);
    const mapped = new UppercaseKeysGraph(inner, () => true, {
      getValue: false,
    });
    assert.deepEqual(await Graph.plain(mapped), {
      A: true,
      B: true,
      C: true,
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
    /** @this {import("@graphorigami/types").AsyncDictionary} */
    async function innerFn(value) {
      const custom = await this.get("custom");
      return `${custom}${value}`;
    }
    /** @this {import("@graphorigami/types").AsyncDictionary} */
    async function outerFn(value) {
      const map = new MapKeysValuesGraph(value, innerFn);
      /** @type {any} */ (map).parent = this;
      return map;
    }
    const outerMap = new MapKeysValuesGraph(graph, outerFn, {
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
