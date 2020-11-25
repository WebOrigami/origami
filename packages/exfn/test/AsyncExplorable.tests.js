import { asyncGet, asyncKeys, keys } from "@explorablegraph/symbols";
import chai from "chai";
import AsyncExplorable from "../src/AsyncExplorable.js";
const { assert } = chai;

describe("AsyncExplorable", () => {
  it("can instantiate with either class function call or new operator", async () => {
    const constructFixture = AsyncExplorable();
    assert.equal(await constructFixture[asyncGet]("hello"), undefined);

    const newFixture = new AsyncExplorable();
    assert.equal(await newFixture[asyncGet]("hello"), undefined);
  });

  it("Can determine whether an object is async explorable", () => {
    const plainObject = {};
    assert(!AsyncExplorable.isExplorable(plainObject));

    const onlyGetNoIterator = {
      async [asyncGet]() {},
    };
    assert(!AsyncExplorable.isExplorable(onlyGetNoIterator));

    const getSyncIterator = {
      async [asyncGet]() {},
      [keys]() {},
    };
    assert(!AsyncExplorable.isExplorable(getSyncIterator));

    // Valid async exfn has both get and async iterator
    const getAsyncIterator = {
      async [asyncGet]() {},
      async *[asyncKeys]() {},
    };
    assert(AsyncExplorable.isExplorable(getAsyncIterator));
  });
});
