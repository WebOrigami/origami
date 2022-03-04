import MapTypesGraph from "../../src/common/MapTypesGraph.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import assert from "../assert.js";

describe("MapTypesGraph", () => {
  it("applies a mapping function to keys that end in a given extension", async () => {
    const fixture = new MapTypesGraph(
      {
        "file1.txt": "will be mapped",
        file2: "won't be mapped",
        "file3.foo": "won't be mapped",
      },
      (s) => s.toUpperCase(),
      ".txt"
    );
    assert.deepEqual(await ExplorableGraph.plain(fixture), {
      "file1.txt": "WILL BE MAPPED",
      file2: "won't be mapped",
      "file3.foo": "won't be mapped",
    });
  });

  it("can change a key's extension", async () => {
    const fixture = new MapTypesGraph(
      {
        "file1.txt": "will be mapped",
        file2: "won't be mapped",
        "file3.foo": "won't be mapped",
      },
      (s) => s.toUpperCase(),
      ".txt",
      ".upper"
    );
    assert.deepEqual(await ExplorableGraph.plain(fixture), {
      "file1.upper": "WILL BE MAPPED",
      file2: "won't be mapped",
      "file3.foo": "won't be mapped",
    });
  });

  it("applies a mapping function to convert extensions in the middle of a path", async () => {
    const fixture = new MapTypesGraph(
      {
        "file1.txt": "Hello, a.",
        file2: "won't be mapped",
      },
      (value) => ({
        data: value,
      }),
      ".txt",
      ".json"
    );
    assert.deepEqual(await ExplorableGraph.plain(fixture), {
      "file1.json": {
        data: "Hello, a.",
      },
      file2: "won't be mapped",
    });
    assert.equal(
      await ExplorableGraph.traverse(fixture, "file1.json", "data"),
      "Hello, a."
    );
  });
});
