import { ObjectGraph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import exceptions from "../../../src/builtins/@graph/exceptions.js";
import InvokeFunctionsTransform from "../../../src/common/InvokeFunctionsTransform.js";
import ExplorableGraph from "../../../src/core/ExplorableGraph.js";
describe("exceptions", () => {
  test("returns the exceptions thrown in a graph", async () => {
    const graph = new (InvokeFunctionsTransform(ObjectGraph))({
      a: "fine",
      b: () => {
        throw "b throws";
      },
      more: {
        c: "fine",
        d: () => {
          throw new TypeError("d throws");
        },
      },
    });
    const fixture = await exceptions.call(null, graph);
    assert.deepEqual(await ExplorableGraph.plain(fixture), {
      b: "b throws",
      more: {
        d: "TypeError: d throws",
      },
    });
  });
});
