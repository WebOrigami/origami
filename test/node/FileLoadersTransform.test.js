import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ObjectGraph from "../../src/core/ObjectGraph.js";
import FileLoadersTransform from "../../src/node/FileLoadersTransform.js";
import assert from "../assert.js";

describe("FileLoadersTransform", () => {
  it("returns the contents of text keys/files as text", async () => {
    const graph = new (FileLoadersTransform(ObjectGraph))({
      foo: 1, // should be left alone
      "bar.txt": 1, // should be cast to a string
    });

    assert.equal(await graph.get("foo"), 1);
    assert.equal(await graph.get("bar.txt"), "1");
  });

  it("interprets .meta files as a metagraph", async () => {
    const graph = new (FileLoadersTransform(ObjectGraph))({
      "foo.meta": `a: Hello
b = a:
`,
    });
    const foo = await graph.get("foo.meta");
    assert.deepEqual(await ExplorableGraph.plain(foo), {
      a: "Hello",
      b: "Hello",
      "b = a": null,
    });
  });
});
