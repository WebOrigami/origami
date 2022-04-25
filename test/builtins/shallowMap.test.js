import shallowMap from "../../src/builtins/shallowMap.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import assert from "../assert.js";

describe("shallowMap", () => {
  it("mapping function context includes the value's graph", async () => {
    const results = shallowMap(
      [{ name: "Alice" }, { name: "Bob" }, { name: "Carol" }],
      /** @this {any} */
      async function () {
        const name = await this.get("name");
        return name;
      }
    );
    assert.deepEqual(await ExplorableGraph.plain(results), [
      "Alice",
      "Bob",
      "Carol",
    ]);
  });
});
