import { asyncGet, asyncSet } from "@explorablegraph/symbols";
import chai from "chai";
import AsyncExplorable from "../src/AsyncExplorable.js";
import asyncExplorableObject from "../src/asyncExplorableObject.js";
import * as asyncOps from "../src/asyncOps.js";
const { assert } = chai;

describe("asyncExplorableObject", () => {
  it("can async explore a plain JavaScript object", async () => {
    const obj = asyncExplorableObject({
      a: 1,
      b: 2,
      c: 3,
    });
    assert(obj instanceof AsyncExplorable);
    assert.equal(await obj[asyncGet]("a"), 1);
    assert.equal(await obj[asyncGet]("b"), 2);
    assert.equal(await obj[asyncGet]("c"), 3);
    assert.equal(await obj[asyncGet]("x"), undefined);

    const keys = [];
    for await (const key of obj) {
      keys.push(key);
    }
    assert.deepEqual(keys, ["a", "b", "c"]);
  });

  it("can traverse a path of keys", async () => {
    const obj = asyncExplorableObject({
      a1: 1,
      a2: {
        b1: 2,
        b2: {
          c1: 3,
          c2: 4,
        },
      },
    });
    assert.equal(await obj[asyncGet]("a1"), 1);
    assert.equal(await obj[asyncGet]("a2", "b2", "c2"), 4);
    assert.equal(await obj[asyncGet]("a2", "doesntexist", "c2"), undefined);
  });

  it("can traverse from one explorable into another", async () => {
    const objB = asyncExplorableObject({
      b1: {
        b2: 1,
      },
    });
    const objA = asyncExplorableObject({
      a1: {
        a2: objB,
      },
    });
    assert.equal(await objA[asyncGet]("a1", "a2", "b1", "b2"), 1);
  });

  it("can set a value", async () => {
    const obj = asyncExplorableObject({
      a: 1,
      b: 2,
      c: 3,
      more: {
        d: 4,
        e: 5,
      },
    });

    // Set key, value.
    await obj[asyncSet]("a", 5);

    // New key.
    await obj[asyncSet]("f", 7);

    // Set deep key, value.
    await obj[asyncSet]("more", "g", 8);

    assert.deepEqual(await asyncOps.plain(obj), {
      a: 5,
      b: 2,
      c: 3,
      more: {
        d: 4,
        e: 5,
        g: 8,
      },
      f: 7,
    });
  });

  it("set can delete a key if the value is explicitly undefined", async () => {
    const obj = asyncExplorableObject({
      a: 1,
      b: 2,
      c: 3,
      more: {
        d: 4,
        e: 5,
      },
    });

    // One arg deletes key.
    await obj[asyncSet]("a");

    // Explicit undefined value deletes key.
    await obj[asyncSet]("b", undefined);

    // Deep deletion
    await obj[asyncSet]("more", "d", undefined);

    assert.deepEqual(await asyncOps.plain(obj), {
      c: 3,
      more: {
        e: 5,
      },
    });
  });
});
