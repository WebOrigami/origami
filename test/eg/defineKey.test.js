import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import defineKey from "../../src/eg/builtins/defineKey.js";
import assert from "../assert.js";

describe("defineKey", () => {
  it("by default makes the value itself the key", async () => {
    const graph = await defineKey(["a", "b", "c"]);
    assert(await ExplorableGraph.plain(graph), {
      a: "a",
      b: "b",
      c: "c",
    });
  });

  it("can define a key from a value property", async () => {
    const graph = await defineKey(
      [
        {
          id: "alice",
          name: "Alice",
        },
        {
          id: "bob",
          name: "Bob",
        },
        {
          id: "carol",
          name: "Carol",
        },
      ],
      "id"
    );
    assert(await ExplorableGraph.plain(graph), {
      alice: {
        id: "alice",
        name: "Alice",
      },
      bob: {
        id: "bob",
        name: "Bob",
      },
      carol: {
        id: "carol",
        name: "Carol",
      },
    });
  });
});
