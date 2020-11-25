import { asyncGet, asyncKeys } from "@explorablegraph/symbols";
import chai from "chai";
// import * as syncOps from "../src/syncOps.js";
import Explorable from "../src/Explorable.js";
const { assert } = chai;

describe("asyncOps", () => {
  it("keys returns keys for an async exfn", async () => {
    const exfn = {
      async [asyncGet]() {},
      async *[asyncKeys]() {
        yield* ["a", "b", "c"];
      },
    };
    assert.deepEqual(await asyncOps.keys(exfn), ["a", "b", "c"]);
  });

  it("plain() produces a plain object version of an exfn", async () => {
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
    const plain = await asyncOps.plain(graph);
    assert.deepEqual(plain, original);
  });

  it("strings() converts exfn leaf values to strings", async () => {
    const graph = new Explorable({
      a: 1,
      b: 2,
      c: 3,
      more: {
        d: 4,
        e: 5,
      },
    });
    const strings = await asyncOps.strings(graph);
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

  it("structure() produces a plain object version of an exfn that has empty values", async () => {
    const graph = new Explorable({
      a: 1,
      b: 2,
      c: 3,
      more: {
        d: 4,
        e: 5,
      },
    });
    const structure = await asyncOps.structure(graph);
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
  //   const json = await asyncOps.json();
  //   assert.equal(json, `{"a":"1","b":"2","c":"3","more":{"d":"4","e":"5"}}`);
  // });

  it("traverse() traverses a graph", async () => {
    const graph = new Explorable({
      a: 1,
      b: 2,
      c: 3,
      more: {
        d: 4,
        e: 5,
      },
    });
    assert.equal(await asyncOps.traverse(graph, ["a"]), 1);
    assert.equal(await asyncOps.traverse(graph, ["more", "e"]), 5);
    assert.isUndefined(await asyncOps.traverse(graph, ["x"]));
  });
});
