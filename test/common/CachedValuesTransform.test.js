import { ExplorableGraph } from "../../exports.js";
import CachedValuesTransform from "../../src/common/CachedValuesTransform.js";
import ObjectGraph from "../../src/core/ObjectGraph.js";
import assert from "../assert.js";

class Greetings {
  get(key) {
    // Always returns new object with key in uppercase
    return new String(key.toUpperCase());
  }
}

describe("CachedValuesTransform", () => {
  it("caches object values", async () => {
    const fixture = new (CachedValuesTransform(ObjectGraph))({
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

  it("can decide whether to cache a value by calling isKeyCachable", async () => {
    class Fixture extends CachedValuesTransform(Greetings) {
      isKeyCachable(key) {
        return key.endsWith(".txt");
      }
    }
    const fixture = new Fixture();
    const a1 = await fixture.get("a.jpeg");
    const a2 = await fixture.get("a.jpeg");
    assert(a1 !== a2);

    const b1 = await fixture.get("b.txt");
    const b2 = await fixture.get("b.txt");
    assert(b1 === b2);
  });
});
