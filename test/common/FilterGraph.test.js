import FilterGraph from "../../src/common/FilterGraph.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ObjectGraph from "../../src/core/ObjectGraph.js";
import MetaTransform from "../../src/framework/MetaTransform.js";
import assert from "../assert.js";

describe("FilterGraph", () => {
  it("uses keys from filter, values from graph", async () => {
    const graph = {
      a: 1,
      b: 2,
      more: {
        c: 3,
        d: 4,
      },
      extra: {
        e: 5,
      },
    };
    const filter = {
      a: "",
      more: {
        d: "", // Ask for d, but not c.
      },
      extra: "", // Ask for entire extra subtree.
    };
    const filtered = new FilterGraph(graph, filter);
    assert.deepEqual(await ExplorableGraph.plain(filtered), {
      a: 1,
      more: {
        d: 4,
      },
      extra: {
        e: 5,
      },
    });
  });

  it.skip("filter can include wildcards", async () => {
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
      // It would be very expensive to filter out empty graphs, even if they
      // don't contain anything that matches the filter, so for now we don't.
      empty: {},
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
      empty: {},
    });
  });

  it("can use a filter wildcard to extract a hidden key from the graph", async () => {
    const graph = new (MetaTransform(ObjectGraph))({
      "…index.html": "Index",
      folder: {
        sub: {},
      },
    });
    const filter = {
      "…index.html": true,
    };
    const fixture = new FilterGraph(graph, filter);
    assert.deepEqual(await ExplorableGraph.plain(fixture), {
      "index.html": "Index",
      folder: {
        "index.html": "Index",
        sub: {
          "index.html": "Index",
        },
      },
    });
  });

  it.skip("filters a graph, but not when it's in scope", async () => {
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
