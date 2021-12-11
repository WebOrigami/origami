import { ExplorableGraph } from "../../exports.js";
import CachedValuesTransform from "../../src/common/CachedValuesTransform.js";
import ExplorableObject from "../../src/core/ExplorableObject.js";
import assert from "../assert.js";

describe("CachedValuesTransform", () => {
  it("caches object values", async () => {
    const fixture = new (CachedValuesTransform(ExplorableObject))({
      a: {
        b: {
          c: 1,
        },
      },
    });
    const a1 = await fixture.get("a");
    const a2 = await fixture.get("a");
    assert(a1 === a2);
    const b1 = await ExplorableGraph.traverse(fixture, "a", "b");
    const b2 = await ExplorableGraph.traverse(fixture, "a", "b");
    assert(b1 === b2);
  });
});
