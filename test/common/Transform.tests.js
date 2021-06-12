import Transform from "../../src/common/Transform.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import assert from "../assert.js";

// Sample class-based transform capitalizes keys and objects from a source
// graph.
class Capitalize extends Transform {
  innerKeyForOuterKey(outerKey) {
    return outerKey >= "A" && outerKey <= "Z"
      ? outerKey.toLowerCase()
      : undefined;
  }
  outerKeyForInnerKey(innerKey) {
    return innerKey >= "a" && innerKey <= "z"
      ? innerKey.toUpperCase()
      : undefined;
  }
  async transform(obj) {
    return obj.toUpperCase();
  }
}

describe("Transform", () => {
  it("does nothing by default", async () => {
    const transform = new Transform({
      a: "The letter a",
      b: "The letter b",
      c: "The letter c",
    });
    assert.deepEqual(await ExplorableGraph.plain(transform), {
      a: "The letter a",
      b: "The letter b",
      c: "The letter c",
    });
  });

  it("can transform keys", async () => {
    // Transform capitalizes the source keys: A <- a.
    const transform = new Transform(
      {
        a: "The letter a",
        b: "The letter b",
        c: "The letter c",
      },
      {
        innerKeyForOuterKey(key) {
          return key >= "A" && key <= "Z" ? key.toLowerCase() : undefined;
        },
        outerKeyForInnerKey(key) {
          return key >= "a" && key <= "z" ? key.toUpperCase() : undefined;
        },
      }
    );
    // The source keys aren't directly available.
    assert.equal(await transform.get("a"), undefined);
    // The transformed keys are available.
    assert.deepEqual(await ExplorableGraph.plain(transform), {
      A: "The letter a",
      B: "The letter b",
      C: "The letter c",
    });
  });

  it("can transform values", async () => {
    // Transform capitalizes the inner keys: A <- a.
    const transform = new Transform(
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
    assert.deepEqual(await ExplorableGraph.plain(transform), {
      a: "THE LETTER A",
      b: "THE LETTER B",
      c: "THE LETTER C",
    });
  });

  it("supports transforms as subclasses", async () => {
    // Transform capitalizes the source keys: A <- a.
    const capitalize = new Capitalize({
      a: "The letter a",
      b: "The letter b",
      c: "The letter c",
    });
    // The transformed keys are available.
    assert.deepEqual(await ExplorableGraph.plain(capitalize), {
      A: "THE LETTER A",
      B: "THE LETTER B",
      C: "THE LETTER C",
    });
  });
});
