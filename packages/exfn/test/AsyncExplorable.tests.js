import chai from "chai";
import AsyncExplorable from "../src/AsyncExplorable.js";
const { assert } = chai;

describe("AsyncExplorable", () => {
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
