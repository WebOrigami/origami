import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import loadJson from "../../src/loaders/json.js";
import assert from "../assert.js";

describe(".json loader", () => {
  it("loads input as a JSON file", async () => {
    const text = `{ "a": 1, "b": 2 }`;
    const textWithGraph = await loadJson.call(null, text);
    const graph = /** @type {any} */ (textWithGraph).toGraph();
    assert.deepEqual(await ExplorableGraph.plain(graph), {
      a: 1,
      b: 2,
    });
  });

  it("if input is already a plain object, treats that as the parsed JSON", async () => {
    const input = {
      a: 1,
      b: 2,
    };
    const textWithGraph = await loadJson.call(null, input);
    assert.equal(String(textWithGraph), `{\n  "a": 1,\n  "b": 2\n}`);
    const graph = /** @type {any} */ (textWithGraph).toGraph();
    assert.deepEqual(await ExplorableGraph.plain(graph), {
      a: 1,
      b: 2,
    });
  });
});
