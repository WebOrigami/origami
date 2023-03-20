import sortBy from "../../src/builtins/sortBy.js";
import assert from "../assert.js";

describe("sortBy", () => {
  it("sorts keys using a provided sort function", async () => {
    const graph = {
      Alice: { age: 48 },
      Bob: { age: 36 },
      Carol: { age: 42 },
    };
    const sorted = await sortBy.call(null, graph, (scope) => scope.get("age"));
    assert.deepEqual(Array.from(await sorted.keys()), [
      "Bob",
      "Carol",
      "Alice",
    ]);
  });
});
