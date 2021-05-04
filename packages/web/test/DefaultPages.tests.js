import chai from "chai";
import DefaultPages from "../src/DefaultPages.js";
const { assert } = chai;

describe("DefaultPages", () => {
  it("adds index.html to keys for a graph that doesn't have one", async () => {
    const fixture = new DefaultPages({
      a: 1,
      b: 2,
      c: 3,
    });
    const keys = await fixture.keys();
    assert(keys.includes("index.html"));
  });

  it("defers to index.html if the inner graph defines one", async () => {
    const fixture = new DefaultPages({
      "index.html": "Index page goes here",
      a: 1,
      b: 2,
      c: 3,
    });
    const index = await fixture.get("index.html");
    assert.equal(index, "Index page goes here");
  });

  it("generates index.html for a graph that doesn't have one", async () => {
    const fixture = new DefaultPages({
      a: 1,
      b: 2,
      c: 3,
      more: {
        d: 4,
        e: 5,
      },
    });

    // Request top index
    const index1 = await fixture.get("index.html");
    assert(index1.includes(`<a href="a">a</a>`));
    assert(index1.includes(`<a href="more/">more/</a>`));

    // Request sub index
    const index2 = await fixture.get("more", "index.html");
    assert(index2.includes(`<a href="d">d</a>`));
  });

  it.skip("generates .keys.json for a graph that doesn't have one", async () => {
    const fixture = new DefaultPages({
      a: 1,
      b: 2,
      c: 3,
      more: {
        d: 4,
        e: 5,
      },
    });

    // Request top keys
    const keysJson1 = await fixture.get(".keys.json");
    const keys1 = JSON.parse(keysJson1);
    assert.deepEqual(keys1, ["index.html", "a", "b", "c", "more/"]);

    // Request sub keys
    const keysJson2 = await fixture.get("more", ".keys.json");
    const keys2 = JSON.parse(keysJson2);
    assert.deepEqual(keys2, ["index.html", "d", "e"]);
  });
});
