import chai from "chai";
import AsyncExplorable from "../src/AsyncExplorable.js";
import AsyncExplorableObject from "../src/AsyncExplorableObject.js";
const { assert } = chai;

describe("AsyncExplorable", () => {
  it("Exports the symbols for recognizing async exfns", () => {
    assert(typeof AsyncExplorable.asyncCall === "symbol");
    assert(typeof AsyncExplorable.asyncGet === "symbol");
  });

  it("Explorable can determine whether an object is async explorable", () => {
    const plainObject = {};
    assert(!AsyncExplorable.isExplorable(plainObject));

    const onlyCallNoIterator = {
      async [AsyncExplorable.asyncCall]() {},
    };
    assert(!AsyncExplorable.isExplorable(onlyCallNoIterator));

    const asyncCallSyncIterator = {
      async [AsyncExplorable.asyncCall]() {},
      [Symbol.iterator]() {},
    };
    assert(!AsyncExplorable.isExplorable(asyncCallSyncIterator));

    const asyncExFn = {
      async [AsyncExplorable.asyncCall]() {},
      async *[Symbol.asyncIterator]() {},
    };
    assert(AsyncExplorable.isExplorable(asyncExFn));
  });

  it("AsyncExplorable.keys returns keys for an async exfn", async () => {
    const exfn = {
      async [AsyncExplorable.asyncCall]() {},
      async *[Symbol.asyncIterator]() {
        yield* ["a", "b", "c"];
      },
    };
    assert.deepEqual(await AsyncExplorable.keys(exfn), ["a", "b", "c"]);
  });

  it(".traverse() traverses a graph", async () => {
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
    // assert.equal(await graph[asyncCall](["a"]), 1);
    // assert.equal(await graph[asyncCall](["more", "e"]), 5);
    // assert.isUndefined(await graph[asyncCall](["x"]));
  });
});
