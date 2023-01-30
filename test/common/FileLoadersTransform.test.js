import FileLoadersTransform from "../../src/common/FileLoadersTransform.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ObjectGraph from "../../src/core/ObjectGraph.js";
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

  it("interprets .graph files as an Origami metagraph", async () => {
    const files = new (FileLoadersTransform(ObjectGraph))({
      "test.graph": `
        name = 'world'
        message = \`Hello, {{ name }}!\`
      `,
    });
    const fixture = await files.get("test.graph");
    assert.deepEqual(await ExplorableGraph.plain(fixture), {
      name: "world",
      message: "Hello, world!",
    });
  });

  it("interprets .meta files as a YAML/JSON metagraph", async () => {
    const graph = new (FileLoadersTransform(ObjectGraph))({
      "foo.meta": `a: Hello
b = a:
`,
    });
    const foo = await graph.get("foo.meta");
    assert.deepEqual(await ExplorableGraph.plain(foo), {
      a: "Hello",
      b: "Hello",
    });
  });
});
