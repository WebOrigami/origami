import { asyncGet, asyncKeys, keys } from "@explorablegraph/symbols";
import chai from "chai";
import AsyncExplorable from "../src/AsyncExplorable.js";
import Explorable from "../src/Explorable.js";
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

  it.skip("AsyncExplorable.keys returns keys for an async exfn", async () => {
    const exfn = {
      async [asyncGet]() {},
      async *[asyncKeys]() {
        yield* ["a", "b", "c"];
      },
    };
    assert.deepEqual(await AsyncExplorable.keys(exfn), ["a", "b", "c"]);
  });

  it.skip("plain() produces a plain object version of an exfn", async () => {
    const original = {
      a: 1,
      b: 2,
      c: 3,
      more: {
        d: 4,
        e: 5,
      },
    };
    const graph = new Explorable(original);
    const plain = await AsyncExplorable.plain(graph);
    assert.deepEqual(plain, original);
  });

  it.skip("strings() converts exfn leaf values to strings", async () => {
    const graph = new Explorable({
      a: 1,
      b: 2,
      c: 3,
      more: {
        d: 4,
        e: 5,
      },
    });
    const strings = await AsyncExplorable.strings(graph);
    assert.deepEqual(strings, {
      a: "1",
      b: "2",
      c: "3",
      more: {
        d: "4",
        e: "5",
      },
    });
  });

  it.skip("structure() produces a plain object version of an exfn that has empty values", async () => {
    const graph = new Explorable({
      a: 1,
      b: 2,
      c: 3,
      more: {
        d: 4,
        e: 5,
      },
    });
    const structure = await AsyncExplorable.structure(graph);
    assert.deepEqual(structure, {
      a: null,
      b: null,
      c: null,
      more: {
        d: null,
        e: null,
      },
    });
  });

  // TODO: Move this to sync package
  // it.skip("json() converts graph to strings to JSON", async () => {
  //   const graph = new Explorable({
  //     a: 1,
  //     b: 2,
  //     c: 3,
  //     more: {
  //       d: 4,
  //       e: 5,
  //     },
  //   });
  //   const json = await AsyncExplorable.json();
  //   assert.equal(json, `{"a":"1","b":"2","c":"3","more":{"d":"4","e":"5"}}`);
  // });

  it.skip("traverse() traverses a graph", async () => {
    const graph = new Explorable({
      a: 1,
      b: 2,
      c: 3,
      more: {
        d: 4,
        e: 5,
      },
    });
    assert.equal(await AsyncExplorable.traverse(graph, ["a"]), 1);
    assert.equal(await AsyncExplorable.traverse(graph, ["more", "e"]), 5);
    assert.isUndefined(await AsyncExplorable.traverse(graph, ["x"]));
  });
});
