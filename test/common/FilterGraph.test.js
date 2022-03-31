import { ExplorableGraph } from "../../exports.js";
import FilterGraph from "../../src/common/FilterGraph.js";
import assert from "../assert.js";

describe("FilterGraph", () => {
  it("runs", async () => {
    const graph = {
      a: 1,
      b: 2,
      "hello.txt": "Hello",
      "goodbye.txt": "Goodbye",
      "something.obj": 3,
      more: {
        "hola.txt": "Hola",
        "extra.junk": 4,
      },
    };
    const filter = {
      a: true,
      "…{x}.txt": true,
    };
    const fixture = new FilterGraph(graph, filter);
    assert.deepEqual(await ExplorableGraph.plain(fixture), {
      a: 1,
      "hello.txt": "Hello",
      "goodbye.txt": "Goodbye",
      more: {
        "hola.txt": "Hola",
      },
    });
  });
});
