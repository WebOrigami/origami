import chai from "chai";
import GraphTransform from "../src/GraphTransform.js";
const { assert } = chai;

// Sample class-based transform capitalizes keys and objects from a source
// graph.
class CapitalizeGraph extends GraphTransform {
  exposedKeyForSourceKey(sourceKey) {
    return lowerToUpper(sourceKey);
  }
  sourceKeyForExposedKey(exposedKey) {
    return upperToLower(exposedKey);
  }
  async transformObject(obj) {
    return obj.toUpperCase();
  }
}

describe("ExplorableTransform", () => {
  it("does nothing by default", async () => {
    const graph = new GraphTransform({
      a: "the letter a",
      b: "the letter b",
      c: "the letter c",
    });
    assert.deepEqual(await graph.resolve(), {
      a: "the letter a",
      b: "the letter b",
      c: "the letter c",
    });
  });

  it("transforms keys and objects with class methods", async () => {
    const graph = new CapitalizeGraph({
      a: "The letter a",
      b: "The letter b",
      c: "The letter c",
    });
    assert.deepEqual(await graph.resolve(), {
      A: "THE LETTER A",
      B: "THE LETTER B",
      C: "THE LETTER C",
    });
  });

  it("transforms keys and objects with supplied functions", async () => {
    const graph = new GraphTransform(
      {
        a: "the letter a",
        b: "the letter b",
        c: "the letter c",
      },
      {
        exposedKeyForSourceKey: (sourceKey) => lowerToUpper(sourceKey),
        sourceKeyForExposedKey: (exposedKey) => upperToLower(exposedKey),
        transformObject: (obj) => obj.toUpperCase(),
      }
    );
    assert.deepEqual(await graph.resolve(), {
      A: "THE LETTER A",
      B: "THE LETTER B",
      C: "THE LETTER C",
    });
  });

  it("transforms keys with supplied graphs", async () => {
    const graph = new GraphTransform(
      {
        a: "the letter a",
        b: "the letter b",
        c: "the letter c",
      },
      {
        exposedKeyForSourceKey: {
          a: "A",
          b: "B",
          c: "C",
        },
        sourceKeyForExposedKey: {
          A: "a",
          B: "b",
          C: "c",
        },
        transformObject: (obj) => obj.toUpperCase(),
      }
    );
    assert.deepEqual(await graph.resolve(), {
      A: "THE LETTER A",
      B: "THE LETTER B",
      C: "THE LETTER C",
    });
  });

  it("transforms objects with a supplied graph", async () => {
    const graph = new GraphTransform(
      {
        a: "d",
        b: "e",
        c: "f",
      },
      {
        transformObject: {
          d: "g",
          e: "h",
          f: "i",
        },
      }
    );
    assert.deepEqual(await graph.resolve(), {
      a: "g",
      b: "h",
      c: "i",
    });
  });
});

// If a letter is uppercase, return its lowercase form.
function upperToLower(letter) {
  return letter.length === 1 && letter >= "A" && letter <= "Z"
    ? letter.toLowerCase()
    : null;
}

// If a letter is lowercase, return its uppercase form.
function lowerToUpper(letter) {
  return letter.length === 1 && letter >= "a" && letter <= "z"
    ? letter.toUpperCase()
    : null;
}
