import chai from "chai";
import AsyncExplorable from "../src/AsyncExplorable.js";
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

    const asyncCallAsyncIterator = {
      async [AsyncExplorable.call]() {},
      [Symbol.syncIterator]() {},
    };
    assert(!AsyncExplorable.isExplorable(asyncCallAsyncIterator));

    const asyncExFn = {
      async [AsyncExplorable.asyncCall]() {},
      async *[Symbol.asyncIterator]() {},
    };
    assert(AsyncExplorable.isExplorable(asyncExFn));
  });

  it("AsyncExplorable.keys returns keys for an async exfn", async () => {
    const exfn = {
      [AsyncExplorable.call]() {},
      async *[Symbol.asyncIterator]() {
        yield* ["a", "b", "c"];
      },
    };
    assert.deepEqual(await AsyncExplorable.keys(exfn), ["a", "b", "c"]);
  });
});
