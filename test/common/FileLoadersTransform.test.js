import FileLoadersTransform from "../../src/common/FileLoadersTransform.js";
import ObjectGraph from "../../src/core/ObjectGraph.js";
import assert from "../assert.js";

describe("FileLoadersTransform", () => {
  it("returns the contents of text keys/files as text", async () => {
    const graph = new (FileLoadersTransform(ObjectGraph))({
      foo: 1, // should be left alone
      "bar.txt": 1, // should be cast to a string
    });
    const foo = await graph.get("foo");
    assert(typeof foo === "number");
    assert.equal(foo, 1);
    const bar = await graph.get("bar.txt");
    assert(typeof bar === "string");
    assert.equal(bar, "1");
  });
});
