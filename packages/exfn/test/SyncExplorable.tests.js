import chai from "chai";
import SyncExplorable from "../src/SyncExplorable.js";
const { assert } = chai;

describe("SyncExplorable", () => {
  it("Exports the symbols for recognizing sync exfns", () => {
    assert(typeof SyncExplorable.call === "symbol");
    assert(typeof SyncExplorable.get === "symbol");
  });

  it("Can determine whether an object is a sync exfn", () => {
    const plainObject = {};
    assert(!SyncExplorable.isExplorable(plainObject));

    const onlyCallNoIterator = {
      [SyncExplorable.call]() {},
    };
    assert(!SyncExplorable.isExplorable(onlyCallNoIterator));

    const syncExFn = {
      [SyncExplorable.call]() {},
      [Symbol.iterator]() {},
    };
    assert(SyncExplorable.isExplorable(syncExFn));

    const asyncExFn = {
      [SyncExplorable.asyncCall]() {},
      [Symbol.asyncIterator]() {},
    };
    assert(!SyncExplorable.isExplorable(asyncExFn));
  });

  it(".keys() returns keys for a sync exfn", () => {
    const exfn = {
      [SyncExplorable.call]() {},
      [Symbol.iterator]() {
        return ["a", "b", "c"][Symbol.iterator]();
      },
    };
    assert.deepEqual(SyncExplorable.keys(exfn), ["a", "b", "c"]);
  });
});
