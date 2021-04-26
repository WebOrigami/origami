import chai from "chai";
import WildcardGraph from "../src/WildcardGraph.js";
const { assert } = chai;

describe.only("WildcardGraph", () => {
  it("Hides wildcards from keys", async () => {
    const graph = new WildcardGraph({
      ":default": 0,
      a: 1,
      b: 2,
      c: 3,
    });

    assert.deepEqual(await graph.keys(), ["a", "b", "c"]);

    // Can still get values
    assert.equal(await graph.get("a"), 1);
    assert.equal(await graph.get(":default"), 0);
  });

  it("Returns wildcard values if requested key is missing", async () => {
    const graph = new WildcardGraph({
      ":default": 0,
      a: 1,
      b: 2,
      c: 3,
    });

    // Real key takes priority.
    assert.equal(await graph.get("a"), 1);

    // Missing key results in wildcard value.
    assert.equal(await graph.get("d"), 0);
  });

  it("Composes explorable values with explorable wildcard values", async () => {});

  it("Handles explorable wildcard values", async () => {
    const graph = new WildcardGraph({
      sub: {
        a: 1,
        b: 2,
        c: 3,
      },
      ":fallback": {
        d: 4,
      },
    });

    const sub = await graph.get("sub");
    assert.deepEqual(await sub.keys(), ["a", "b", "c", "d"]);

    // Real keys work.
    assert.equal(await graph.get("sub", "a"), 1);

    // Wildcard keys work.
    assert.equal(await graph.get("sub", "d"), 4);
  });

  it("Handles nested wildcards", async () => {
    const graph = new WildcardGraph({
      sub: {
        subsub: {
          a: 1,
        },
      },
      ":fallback": {
        ":fallbacksub": {
          b: 2,
        },
      },
    });

    const subsub = await graph.get("sub", "subsub");
    assert.deepEqual(await subsub.keys(), ["a", "b"]);
  });

  // handle multiple wildcards
});
