import sort from "../../../src/builtins/@graph/sort.js";
import assert from "../../assert.js";

describe("@graph/sort", () => {
  it("sorts keys", async () => {
    const graph = {
      b: 2,
      c: 3,
      a: 1,
    };
    const sorted = await sort.call(null, graph);
    assert.deepEqual(Array.from(await sorted.keys()), ["a", "b", "c"]);
  });

  it("sorts keys using a provided sort function", async () => {
    const graph = {
      Alice: { age: 48 },
      Bob: { age: 36 },
      Carol: { age: 42 },
    };
    const sorted = await sort.call(null, graph, (scope) => scope.get("age"));
    assert.deepEqual(Array.from(await sorted.keys()), [
      "Bob",
      "Carol",
      "Alice",
    ]);
  });
});
