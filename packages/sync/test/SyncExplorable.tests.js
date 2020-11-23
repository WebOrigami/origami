import chai from "chai";
import SyncExplorable from "../src/SyncExplorable.js";
const { assert } = chai;

describe("SyncExplorable", () => {
  it("Exports the symbols for recognizing sync exfns", () => {
    assert(typeof SyncExplorable.get === "symbol");
  });

  it("Can determine whether an object is a sync exfn", () => {
    const neitherCallNorIterator = {};
    assert(!SyncExplorable.isExplorable(neitherCallNorIterator));

    const getWithoutIterator = {
      [SyncExplorable.get]() {},
    };
    assert(!SyncExplorable.isExplorable(getWithoutIterator));

    const getButAsyncIterator = {
      [SyncExplorable.get]() {},
      [Symbol.asyncIterator]() {},
    };
    assert(!SyncExplorable.isExplorable(getButAsyncIterator));

    // Valid sync exfn has both get and sync iterator
    const getAndSyncIterator = {
      [SyncExplorable.get]() {},
      [Symbol.iterator]() {},
    };
    assert(SyncExplorable.isExplorable(getAndSyncIterator));
  });

  it(".keys() returns keys for a sync exfn", () => {
    const exfn = {
      [SyncExplorable.get]() {},
      [Symbol.iterator]() {
        return ["a", "b", "c"][Symbol.iterator]();
      },
    };
    assert.deepEqual(SyncExplorable.keys(exfn), ["a", "b", "c"]);
  });
});
