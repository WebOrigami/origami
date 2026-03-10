import assert from "node:assert";
import { describe, test } from "node:test";
import ObjectMap from "../../src/drivers/ObjectMap.js";
import deepEntriesIterator from "../../src/operations/deepEntriesIterator.js";

describe("deepEntriesIterator", () => {
  test("returns an iterator of a tree's deep entries", async () => {
    const tree = new ObjectMap({
      a: 1,
      b: 2,
      more: {
        c: 3,
        d: 4,
      },
    });
    const entries = [];
    // The tree will be shallow, but we'll ask to expand the entries.
    for await (const entry of deepEntriesIterator(tree, { expand: true })) {
      entries.push(entry);
    }
    assert.deepEqual(entries, [
      ["a", 1],
      ["b", 2],
      ["c", 3],
      ["d", 4],
    ]);
  });

  test("if depth is specified, only descends to specified depth", async () => {
    const tree = new ObjectMap({
      a: 1,
      sub: {
        b: 2,
        more: {
          c: 3,
          deeper: {
            d: 4,
          },
        },
      },
    });
    const entries = [];
    for await (const entry of deepEntriesIterator(tree, {
      depth: 3,
      expand: true,
    })) {
      entries.push(entry);
    }
    assert.deepEqual(entries, [
      ["a", 1],
      ["b", 2],
      ["c", 3],
      ["deeper", { d: 4 }],
    ]);
  });

  test("can optionally unpack a packed value", async () => {
    /** @type {any} */
    const packed = new String("String that unpacks to data");
    packed.unpack = async function () {
      return {
        message: "Hello",
      };
    };
    const tree = {
      a: 1,
      packed,
    };
    const entries = [];
    for await (const entry of deepEntriesIterator(tree, { expand: true })) {
      entries.push(entry);
    }
    assert.deepEqual(entries, [
      ["a", 1],
      ["packed", { message: "Hello" }],
    ]);
  });
});
