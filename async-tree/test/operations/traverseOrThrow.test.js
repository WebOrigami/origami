import assert from "node:assert";
import { describe, test } from "node:test";
import ObjectMap from "../../src/drivers/ObjectMap.js";
import traverseOrThrow from "../../src/operations/traverseOrThrow.js";

describe("traverseOrThrow", () => {
  test("traverses a path of keys", async () => {
    const tree = new ObjectMap({
      a1: 1,
      a2: {
        b1: 2,
        b2: {
          c1: 3,
          c2: 4,
        },
      },
    });
    assert.equal(await traverseOrThrow(tree), tree);
    assert.equal(await traverseOrThrow(tree, "a1"), 1);
    assert.equal(await traverseOrThrow(tree, "a2", "b2", "c2"), 4);
    assert.rejects(
      async () => await traverseOrThrow(tree, "a2", "doesntexist", "c2"),
      {
        name: "TraverseError",
        message: "A path hit a null or undefined value.",
      },
    );
  });

  test("traverses a function with fixed number of arguments", async () => {
    const tree = (a, b) => ({
      c: "Result",
    });
    assert.equal(await traverseOrThrow(tree, "a", "b", "c"), "Result");
  });

  test("traverses from one tree into another", async () => {
    const tree = new ObjectMap({
      a: {
        b: new Map([
          ["c", "Hello"],
          ["d", "Goodbye"],
        ]),
      },
    });
    assert.equal(await traverseOrThrow(tree, "a", "b", "c"), "Hello");
  });

  test("unpacks last value if key ends in a slash", async () => {
    const tree = new ObjectMap({
      a: {
        b: Object.assign(new String("packed"), {
          unpack() {
            return "unpacked";
          },
        }),
      },
    });
    assert.equal(await traverseOrThrow(tree, "a/", "b/"), "unpacked");
  });

  test("throws if the last key ends in a slash but the value can't be unpacked", async () => {
    const tree = new ObjectMap({
      a: {
        b: 1,
      },
    });
    await assert.rejects(async () => await traverseOrThrow(tree, "a/", "b/"), {
      name: "TraverseError",
      message: "A path tried to unpack data that's already unpacked.",
    });
  });
});
