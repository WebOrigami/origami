import { Explorable, syncOps } from "@explorablegraph/exfn";
import { get, keys } from "@explorablegraph/symbols";
import chai from "chai";
const { assert } = chai;

describe("syncOps", () => {
  it("keys returns keys for an exfn", () => {
    const exfn = {
      [get]() {},
      *[keys]() {
        yield* ["a", "b", "c"];
      },
    };
    assert.deepEqual(syncOps.keys(exfn), ["a", "b", "c"]);
  });

  // it("mapKeys() maps an exfns keys using a mapping function", () => {
  //   const original = Explorable({
  //     a: 1,
  //     b: 2,
  //     c: 3,
  //   });
  //   const mapped = syncOps.mapKeys(original, (key) => key.toUpperCase());
  //   const plain = syncOps.plain(mapped);
  //   assert.deepEqual(plain, original);
  // });

  it("plain() produces a plain object version of an exfn", () => {
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
    const plain = syncOps.plain(graph);
    assert.deepEqual(plain, original);
  });

  it("strings() converts exfn leaf values to strings", () => {
    const exfn = new Explorable({
      a: 1,
      b: 2,
      c: 3,
      more: {
        d: 4,
        e: 5,
      },
    });
    const strings = syncOps.strings(exfn);
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

  it("structure() produces a plain object version of an exfn that has empty values", () => {
    const graph = new Explorable({
      a: 1,
      b: 2,
      c: 3,
      more: {
        d: 4,
        e: 5,
      },
    });
    const structure = syncOps.structure(graph);
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

  it("traverse() traverses a graph", () => {
    const graph = new Explorable({
      a: 1,
      b: 2,
      c: 3,
      more: {
        d: 4,
        e: 5,
      },
    });
    assert.equal(syncOps.traverse(graph, ["a"]), 1);
    assert.equal(syncOps.traverse(graph, ["more", "e"]), 5);
    assert.isUndefined(syncOps.traverse(graph, ["x"]));
  });
});
