import { asyncGet, asyncKeys, keys } from "@explorablegraph/symbols";
import chai from "chai";
import AsyncExplorable from "../src/AsyncExplorable.js";
const { assert } = chai;

describe("AsyncExplorable", () => {
  it("can instantiate", async () => {
    const newFixture = new AsyncExplorable();
    assert.equal(await newFixture[asyncGet]("hello"), undefined);
  });

  it("Can determine whether an object is async explorable", () => {
    const plainObject = {};
    assert(!(plainObject instanceof AsyncExplorable));

    const onlyGetNoIterator = {
      async [asyncGet]() {},
    };
    assert(!(onlyGetNoIterator instanceof AsyncExplorable));

    const getSyncIterator = {
      async [asyncGet]() {},
      [keys]() {},
    };
    assert(!(getSyncIterator instanceof AsyncExplorable));

    // Valid async exfn has both get and async iterator
    const getAsyncIterator = {
      async [asyncGet]() {},
      async *[asyncKeys]() {},
    };
    assert(getAsyncIterator instanceof AsyncExplorable);
  });
});
