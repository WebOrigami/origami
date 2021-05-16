import chai from "chai";
import { ExplorableObject } from "../../src/core/ExplorableGraph.js";
import CommonFileTypesMixin from "../../src/node/CommonFileTypesMixin.js";
const { assert } = chai;

describe("CommonFileTypesMixin", () => {
  it("returns the contents of .json keys/files as parsed JSON objects", async () => {
    const graph = new (CommonFileTypesMixin(ExplorableObject))({
      foo: `{ "message": "foo" }`, // should be left alone
      "bar.json": `{ "message": "bar" }`, // should be parsed
    });

    assert.equal(await graph.get("foo"), `{ "message": "foo" }`);
    assert.deepEqual(await graph.get("bar.json"), { message: "bar" });
  });
});
