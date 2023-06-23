import assert from "node:assert";
import { describe, test } from "node:test";
import set from "../../../src/builtins/@frontMatter/set.js";
import ExplorableGraph from "../../../src/core/ExplorableGraph.js";

describe("@frontMatter/set", () => {
  test("attaches data to text", async () => {
    const fixture = set("Hello, world!", { foo: "bar" });
    assert.equal(String(fixture), "Hello, world!");
    const graph = fixture.toGraph();
    assert.deepEqual(await ExplorableGraph.plain(graph), { foo: "bar" });
  });
});
