import chai from "chai";
import AsyncExplorable from "../src/AsyncExplorable.js";
import AsyncExplorableObject from "../src/AsyncExplorableObject.js";
const { assert } = chai;

describe("AsyncExplorable", () => {
  it("Exports the symbols for recognizing async exfns", () => {
    assert(typeof AsyncExplorable.get === "symbol");
  });

  it("Can determine whether an object is async explorable", () => {
    const plainObject = {};
    assert(!AsyncExplorable.isExplorable(plainObject));

    const onlyGetNoIterator = {
      async [AsyncExplorable.get]() {},
    };
    assert(!AsyncExplorable.isExplorable(onlyGetNoIterator));

    const getSyncIterator = {
      async [AsyncExplorable.get]() {},
      [Symbol.iterator]() {},
    };
    assert(!AsyncExplorable.isExplorable(getSyncIterator));

    // Valid async exfn has both get and async iterator
    const getAsyncIterator = {
      async [AsyncExplorable.get]() {},
      async *[Symbol.asyncIterator]() {},
    };
    assert(AsyncExplorable.isExplorable(getAsyncIterator));
  });

  it("AsyncExplorable.keys returns keys for an async exfn", async () => {
    const exfn = {
      async [AsyncExplorable.get]() {},
      async *[Symbol.asyncIterator]() {
        yield* ["a", "b", "c"];
      },
    };
    assert.deepEqual(await AsyncExplorable.keys(exfn), ["a", "b", "c"]);
  });

  it("traverse() traverses a graph", async () => {
    const graph = new AsyncExplorableObject({
      a: 1,
      b: 2,
      c: 3,
      more: {
        d: 4,
        e: 5,
      },
    });
    assert.equal(await AsyncExplorable.traverse(graph, ["a"]), 1);
    assert.equal(await AsyncExplorable.traverse(graph, ["more", "e"]), 5);
    assert.isUndefined(await AsyncExplorable.traverse(graph, ["x"]));
  });
});
