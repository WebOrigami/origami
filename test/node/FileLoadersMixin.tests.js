import ExplorableObject from "../../src/core/ExplorableObject.js";
import FileLoadersMixin from "../../src/node/FileLoadersMixin.js";
import assert from "../assert.js";

describe("FileLoadersMixin", () => {
  it("returns the contents of text keys/files as text", async () => {
    const graph = new (FileLoadersMixin(ExplorableObject))({
      foo: 1, // should be left alone
      "bar.txt": 1, // should be cast to a string
    });

    assert.equal(await graph.get("foo"), 1);
    assert.equal(await graph.get("bar.txt"), "1");
  });
});
