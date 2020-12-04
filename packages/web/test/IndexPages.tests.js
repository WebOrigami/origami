import { asyncGet, asyncOps } from "@explorablegraph/core";
import chai from "chai";
import IndexPages from "../src/IndexPages.js";
const { assert } = chai;

describe("IndexPages", () => {
  it("adds index.html to keys for a graph that doesn't have one", async () => {
    const fixture = new IndexPages({
      a: 1,
      b: 2,
      c: 3,
    });
    const keys = await asyncOps.keys(fixture);
    assert(keys.includes("index.html"));
  });

  it("defers to index.html if the inner graph defines one", async () => {
    const fixture = new IndexPages({
      "index.html": "Index page goes here",
      a: 1,
      b: 2,
      c: 3,
    });
    const index = await fixture[asyncGet]("index.html");
    assert.equal(index, "Index page goes here");
  });

  it("generates index.html for a graph that doesn't have one", async () => {
    const fixture = new IndexPages({
      a: 1,
      b: 2,
      c: 3,
      more: {
        d: 4,
        e: 5,
      },
    });

    // Request top index
    const index1 = await fixture[asyncGet]("index.html");
    assert(index1.includes(`<a href="a">a</a>`));
    assert(index1.includes(`<a href="more/">more/</a>`));

    // Request sub index
    const index2 = await fixture[asyncGet]("more", "index.html");
    assert(index2.includes(`<a href="d">d</a>`));

    // Request subgraph, implies index
    const index3 = await fixture[asyncGet]("more");
    assert(index3.includes(`<a href="d">d</a>`));
  });
});
