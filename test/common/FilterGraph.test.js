import FilterGraph from "../../src/common/FilterGraph.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ObjectGraph from "../../src/core/ObjectGraph.js";
import MetaTransform from "../../src/framework/MetaTransform.js";
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
      "[x].js": true,
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

  it("filters a graph, but not when it's in scope", async () => {
    const graph1 = new FilterGraph(
      {
        show: "A",
        hide: "B",
      },
      {
        show: true,
      }
    );
    const graph2 = new (MetaTransform(ObjectGraph))({
      "letter = hide": "",
    });
    graph2.parent = graph1;

    // Direct get("hide") is filtered.
    assert.equal(await graph1.get("hide"), undefined);

    // But "hide" is in scope, so get("letter") is not filtered.
    const letter = await graph2.get("letter");
    assert.equal(letter, "B");
  });
});
