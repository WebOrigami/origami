import FilterGraph from "../../src/common/FilterGraph.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import assert from "../assert.js";

describe("FilterGraph", () => {
  it("filters a graph", async () => {
    const graph = {
      a: 1,
      b: 2,
      "hello.txt": "Hello",
      "goodbye.txt": "Goodbye",
      "something.obj": 3,
      "fn.js": `export default true;`,
      more: {
        "hola.txt": "Hola",
        "extra.junk": 4,
      },
    };
    const filter = {
      a: true,
      "…[x].js": true,
      "…[x].txt": true,
    };
    const fixture = new FilterGraph(graph, filter);
    assert.deepEqual(await ExplorableGraph.plain(fixture), {
      a: 1,
      "hello.txt": "Hello",
      "goodbye.txt": "Goodbye",
      "fn.js": `export default true;`,
      more: {
        "hola.txt": "Hola",
      },
    });
  });
});
