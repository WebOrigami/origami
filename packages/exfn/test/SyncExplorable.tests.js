import chai from "chai";
import SyncExplorable from "../src/SyncExplorable.js";
const { assert } = chai;

describe("SyncExplorable", () => {
  it("SyncExplorable.keys returns keys for a sync exfn", () => {
    const exfn = {
      [SyncExplorable.call]() {},
      [Symbol.iterator]() {
        return ["a", "b", "c"][Symbol.iterator]();
      },
    };
    assert.deepEqual(SyncExplorable.keys(exfn), ["a", "b", "c"]);
  });
});
