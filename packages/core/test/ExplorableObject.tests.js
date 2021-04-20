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

  // it.skip("can set a value", async () => {
  //   const obj = new ExplorableObject({
  //     a: 1,
  //     b: 2,
  //     c: 3,
  //     more: {
  //       d: 4,
  //       e: 5,
  //     },
  //   });

  //   // Set key, value.
  //   await obj[asyncSet]("a", 5);

  //   // New key.
  //   await obj[asyncSet]("f", 7);

  //   // Set deep key, value.
  //   await obj[asyncSet]("more", "g", 8);

  //   assert.deepEqual(await asyncOps.plain(obj), {
  //     a: 5,
  //     b: 2,
  //     c: 3,
  //     more: {
  //       d: 4,
  //       e: 5,
  //       g: 8,
  //     },
  //     f: 7,
  //   });
  // });

  // it.skip("set can delete a key if the value is explicitly undefined", async () => {
  //   const obj = new ExplorableObject({
  //     a: 1,
  //     b: 2,
  //     c: 3,
  //     more: {
  //       d: 4,
  //       e: 5,
  //     },
  //   });

  //   // One arg deletes key.
  //   await obj[asyncSet]("a");

  //   // Explicit undefined value deletes key.
  //   await obj[asyncSet]("b", undefined);

  //   // Deep deletion
  //   await obj[asyncSet]("more", "d", undefined);

  //   assert.deepEqual(await asyncOps.plain(obj), {
  //     c: 3,
  //     more: {
  //       e: 5,
  //     },
  //   });
  // });
});
