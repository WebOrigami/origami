import chai from "chai";
import { ExplorableObject } from "../../core/exports.js";
import CommonFileTypesMixin from "../src/CommonFileTypesMixin.js";
const { assert } = chai;

describe.only("CommonFileTypesMixin", () => {
  it("returns the contents of .json keys/files as parsed JSON objects", async () => {
    const graph = new (CommonFileTypesMixin(ExplorableObject))({
      foo: `{ "message": "foo" }`, // should be left alone
      "bar.json": `{ "message": "bar" }`, // should be parsed
    });

    assert.equal(await graph.get("foo"), `{ "message": "foo" }`);
    assert.deepEqual(await graph.get("bar.json"), { message: "bar" });
  });
});
