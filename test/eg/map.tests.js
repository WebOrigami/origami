import { ExplorableGraph } from "../../exports.js";
import map from "../../src/eg/builtins/map.js";
import assert from "../assert.js";

describe("map", () => {
  it("maps all the values in a graph", async () => {
    const fixture = map(
      {
        a: "Hello, a.",
        b: "Hello, b.",
        c: "Hello, c.",
      },
      (value) => value.toUpperCase()
    );
    assert.deepEqual(await ExplorableGraph.plain(fixture), {
      a: "HELLO, A.",
      b: "HELLO, B.",
      c: "HELLO, C.",
    });
  });

  it("applies a mapping function to convert designated file extensions", async () => {
    const fixture = map(
      {
        "file1.txt": "will be mapped",
        file2: "won't be mapped",
        "file3.foo": "won't be mapped",
      },
      (value) => value.toUpperCase(),
      ".txt",
      ".upper"
    );
    assert.deepEqual(await ExplorableGraph.plain(fixture), {
      "file1.upper": "WILL BE MAPPED",
      file2: "won't be mapped",
      "file3.foo": "won't be mapped",
    });
  });
});
