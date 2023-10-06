import { Graph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import MergeGraph from "../../src/common/MergeGraph.js";

describe("MergeGraph", () => {
  test("returns the first defined value from an ordered list of graphs", async () => {
    const fixture = new MergeGraph(
      {
        a: 1,
        c: 3,
      },
      {
        b: 2,
        c: 0, // Will be obscured by `c` above
        d: 4,
      }
    );
    const keys = Array.from(await fixture.keys());
    assert.deepEqual(keys, ["a", "c", "b", "d"]);
    assert.equal(await fixture.get("a"), 1);
    assert.equal(await fixture.get("b"), 2);
    assert.equal(await fixture.get("c"), 3);
    assert.equal(await fixture.get("d"), 4);
    assert.equal(await fixture.get("x"), undefined);
  });

  test("performs a shallow merge", async () => {
    const fixture = new MergeGraph(
      {
        a: 1,
        b: {
          c: 2,
        },
      },
      {
        b: {
          d: 3,
        },
      }
    );
    const b = await fixture.get("b");
    assert.deepEqual(await Graph.plain(b), {
      c: 2,
    });
    const d = await Graph.traverse(fixture, "b", "d");
    assert.equal(d, undefined);
  });
});
