import chai from "chai";
import TransformGraph from "../src/TransformGraph.js";
const { assert } = chai;

// Sample class-based transform capitalizes keys and objects from a source
// graph.
class CapitalizeGraph extends TransformGraph {
  sourceKeyForVirtualKey(key) {
    return key >= "A" && key <= "Z" ? key.toLowerCase() : null;
  }
  virtualKeyForSourceKey(key) {
    return key >= "a" && key <= "z" ? key.toUpperCase() : null;
  }
  async transform(obj) {
    return obj.toUpperCase();
  }
}

describe("TransformGraph", () => {
  it("does nothing by default", async () => {
    const graph = new TransformGraph({
      a: "The letter a",
      b: "The letter b",
      c: "The letter c",
    });
    assert.deepEqual(await graph.resolve(), {
      a: "The letter a",
      b: "The letter b",
      c: "The letter c",
    });
  });

  it("can transform keys", async () => {
    // Transform capitalizes the source keys: A <- a.
    const graph = new TransformGraph(
      {
        a: "The letter a",
        b: "The letter b",
        c: "The letter c",
      },
      {
        sourceKeyForVirtualKey(key) {
          return key >= "A" && key <= "Z" ? key.toLowerCase() : null;
        },
        virtualKeyForSourceKey(key) {
          return key >= "a" && key <= "z" ? key.toUpperCase() : null;
        },
      }
    );
    // The source keys aren't directly available.
    assert.equal(await graph.get("a"), undefined);
    // The transformed keys are available.
    assert.deepEqual(await graph.resolve(), {
      A: "The letter a",
      B: "The letter b",
      C: "The letter c",
    });
  });

  it("can transform objects", async () => {
    // Transform capitalizes the source keys: A <- a.
    const graph = new TransformGraph(
      {
        a: "The letter a",
        b: "The letter b",
        c: "The letter c",
      },
      {
        async transform(obj) {
          return obj.toUpperCase();
        },
      }
    );
    // The transformed keys are available.
    assert.deepEqual(await graph.resolve(), {
      a: "THE LETTER A",
      b: "THE LETTER B",
      c: "THE LETTER C",
    });
  });

  it("supports transform subclasses", async () => {
    // Transform capitalizes the source keys: A <- a.
    const graph = new CapitalizeGraph({
      a: "The letter a",
      b: "The letter b",
      c: "The letter c",
    });
    // The transformed keys are available.
    assert.deepEqual(await graph.resolve(), {
      A: "THE LETTER A",
      B: "THE LETTER B",
      C: "THE LETTER C",
    });
  });
});
