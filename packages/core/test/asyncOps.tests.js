import { asyncGet, asyncKeys } from "@explorablegraph/symbols";
import chai from "chai";
import AsyncExplorable from "../src/AsyncExplorable.js";
import * as asyncOps from "../src/asyncOps.js";
import explorablePlainObject from "../src/explorablePlainObject.js";
const { assert } = chai;

describe("asyncOps", () => {
  // it.only("update(target, source) copies source graph into corresponding target graph", async () => {
  //   const target = explorablePlainObject({
  //     a: 1,
  //     b: 2,
  //     c: 3,
  //     more: {
  //       d: 4,
  //       e: 5,
  //     },
  //   });
  //   const source = explorablePlainObject({
  //     a: 6,
  //     b: undefined,
  //     f: 7,
  //     more: {
  //       d: 8,
  //       e: {
  //         g: 9,
  //       },
  //     },
  //   });
  //   await asyncOps.update(target, source);
  //   assert.deepEqual(asyncOps.plain(target), {
  //     a: 6,
  //     c: 3,
  //     more: {
  //       d: 8,
  //       e: {
  //         g: 9,
  //       },
  //     },
  //     f: 7,
  //   });
  // });

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
    const graph = new explorablePlainObject(original);
    const plain = await asyncOps.plain(graph);
    assert.deepEqual(plain, original);
  });

  it("strings() converts exfn leaf values to strings", async () => {
    const graph = new explorablePlainObject({
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
    const graph = new explorablePlainObject({
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

  it.only("traversal() invokes a callback with each node in depth-first order", async () => {
    const graph = new explorablePlainObject({
      a: 1,
      b: 2,
      c: 3,
      more: {
        d: 4,
        e: 5,
      },
    });
    const results = [];
    await asyncOps.traversal(graph, (keys, interior, value) => {
      results.push({ keys, interior, value });
    });
    const plain = await Promise.all(
      results.map(async ({ keys, interior, value }) => {
        return {
          keys,
          interior,
          value:
            value instanceof AsyncExplorable
              ? await asyncOps.plain(value)
              : value,
        };
      })
    );
    assert.deepEqual(plain, [
      { keys: ["a"], interior: false, value: 1 },
      { keys: ["b"], interior: false, value: 2 },
      { keys: ["c"], interior: false, value: 3 },
      { keys: ["more"], interior: true, value: { d: 4, e: 5 } },
      { keys: ["more", "d"], interior: false, value: 4 },
      { keys: ["more", "e"], interior: false, value: 5 },
    ]);
  });
});
