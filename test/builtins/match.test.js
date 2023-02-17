import match from "../../src/builtins/match.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import assert from "../assert.js";

describe("match", () => {
  it("matches keys against a simplified pattern", async () => {
    /** @this {Explorable} */
    async function fn() {
      const name = await this.get("name");
      return `Hello, ${name}!`;
    }
    const graph = match.call(null, "[name].html", fn, [
      "Alice.html",
      "Bob.html",
      "Carol.html",
    ]);
    assert.deepEqual(await ExplorableGraph.plain(graph), {
      "Alice.html": "Hello, Alice!",
      "Bob.html": "Hello, Bob!",
      "Carol.html": "Hello, Carol!",
    });
    const value = await graph.get("David.html");
    assert.equal(value, "Hello, David!");
  });

  it("matches keys against a regular expression", async () => {
    /** @this {Explorable} */
    async function fn() {
      const name = await this.get("name");
      return `Hello, ${name}!`;
    }
    const graph = match.call(null, /^(?<name>.+)\.html$/, fn);
    const value = await graph.get("Alice.html");
    assert.equal(value, "Hello, Alice!");
  });
});
