import chai from "chai";
import ExplorableObject from "../src/ExplorableObject.js";
const { assert } = chai;

describe("ExplorableObject", () => {
  it("can async explore a plain JavaScript object", async () => {
    const obj = new ExplorableObject({
      a: 1,
      b: 2,
      c: 3,
    });
    assert.equal(await obj.get("a"), 1);
    assert.equal(await obj.get("b"), 2);
    assert.equal(await obj.get("c"), 3);
    assert.equal(await obj.get("x"), undefined);

    const keys = [];
    for await (const key of obj) {
      keys.push(key);
    }
    assert.deepEqual(keys, ["a", "b", "c"]);
  });

  it("can traverse a path of keys", async () => {
    const obj = new ExplorableObject({
      a1: 1,
      a2: {
        b1: 2,
        b2: {
          c1: 3,
          c2: 4,
        },
      },
    });
    assert.equal(await obj.get("a1"), 1);
    assert.equal(await obj.get("a2", "b2", "c2"), 4);
    assert.equal(await obj.get("a2", "doesntexist", "c2"), undefined);
  });

  it("can traverse from one explorable into another", async () => {
    const obj = new ExplorableObject({
      a1: {
        a2: new ExplorableObject({
          b1: {
            b2: 1,
          },
        }),
      },
    });
    assert.equal(await obj.get("a1", "a2", "b1", "b2"), 1);
  });

  it("can set a value", async () => {
    const obj = new ExplorableObject({
      a: 1,
      b: 2,
      c: 3,
      more: {
        d: 4,
        e: 5,
      },
    });

    // Set key, value.
    await obj.set("a", 5);

    // New key.
    await obj.set("f", 7);

    // Set deep key, value.
    await obj.set("more", "g", 8);

    assert.deepEqual(await obj.plain(), {
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
    const obj = new ExplorableObject({
      a: 1,
      b: 2,
      c: 3,
      more: {
        d: 4,
        e: 5,
      },
    });

    // One arg deletes key.
    await obj.set("a");

    // Explicit undefined value deletes key.
    await obj.set("b", undefined);

    // Deep deletion
    await obj.set("more", "d", undefined);

    assert.deepEqual(await obj.plain(), {
      c: 3,
      more: {
        e: 5,
      },
    });
  });

  it("uses iterator and get method on object if defined", async () => {
    const obj = new ExplorableObject({
      async *[Symbol.asyncIterator]() {
        yield* ["a", "b", "c"];
      },

      async get(key) {
        return key.toUpperCase();
      },
    });

    assert.deepEqual(await obj.keys(), ["a", "b", "c"]);
    assert.equal(await obj.get("a"), "A");
    assert.equal(await obj.get("foo"), "FOO");
  });
});
