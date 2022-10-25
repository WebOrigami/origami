import sortBy from "../../src/builtins/sortBy.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import assert from "../assert.js";

describe("sortBy", () => {
  it("sorts keys using a provided sort function", async () => {
    const graph = {
      Alice: { age: 48 },
      Bob: { age: 36 },
      Carol: { age: 42 },
    };
    const sorted = await sortBy(graph, (scope) => scope.get("age"));
    assert.deepEqual(await ExplorableGraph.keys(sorted), [
      "Bob",
      "Carol",
      "Alice",
    ]);
  });
});
