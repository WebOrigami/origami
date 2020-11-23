import chai from "chai";
import ObjectGraph from "../src/ObjectGraph.js";
const { assert } = chai;

describe("ObjectGraph", () => {
  it("Can enumerate keys and retrieve objects synchronously", async () => {
    const graph = new ObjectGraph({
      hello: "Bonjour",
      goodbye: "Avoir",
    });
    // The `await` is not needed here since an ObjectGraph has a synchronous
    // iterator instead of an async iterator. Still, we can confirm that the
    // sync iterator works as expected with the `for await` construct, since
    // that's how it will often be used.
    const keys = [];
    for await (const key of graph) {
      keys.push(key);
    }
    assert.deepEqual(keys, ["hello", "goodbye"]);
    // Same as above: we know it will be sync, but want to confirm async use.
    const obj = await graph.get("hello");
    assert.equal(obj, "Bonjour");
  });

  it("Can retrieve objects asynchronously", async () => {
    const graph = new ObjectGraph({
      hello: Promise.resolve("Bonjour"),
    });
    const obj = await graph.get("hello");
    assert.equal(obj, "Bonjour");
  });
});
