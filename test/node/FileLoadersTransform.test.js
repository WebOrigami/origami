import ExplorableObject from "../../src/core/ExplorableObject.js";
import FileLoadersTransform from "../../src/node/FileLoadersTransform.js";
import assert from "../assert.js";

describe("FileLoadersTransform", () => {
  it("returns the contents of text keys/files as text", async () => {
    const graph = new (FileLoadersTransform(ExplorableObject))({
      foo: 1, // should be left alone
      "bar.txt": 1, // should be cast to a string
    });

    assert.equal(await graph.get("foo"), 1);
    assert.equal(await graph.get("bar.txt"), "1");
  });
});
