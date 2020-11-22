import chai from "chai";
import { call, default as Explorable } from "../src/Explorable.js";
const { assert } = chai;

describe.only("Explorable", () => {
  it("an object can expose the [Explorable.call] symbol to make itself invocable", () => {
    const fixture = {
      [call](arg) {
        return `Got ${arg}`;
      },
    };
    const value = Explorable.call(fixture, "foo");
    assert.equal(value, "Got foo");
  });

  it("Explorable.call invokes a function directly", () => {
    const fixture = (a, b) => a + b;
    const value = Explorable.call(fixture, "foo", "bar");
    assert.equal(value, "foobar");
  });

  it("can return the keys for a function with an async iterator", async () => {
    const fixture = (x) => x;
    fixture[Symbol.asyncIterator] = function* () {
      yield* ["a", "b", "c"];
    };
    assert.deepEqual(await Explorable.keys(fixture), ["a", "b", "c"]);
  });

  it("Explorable.from can crate an explorable plain object", async () => {
    const fixture = Explorable.from({
      a: 1,
      b: 2,
      c: 3,
    });
    const keys = await Explorable.keys(fixture);
    assert.deepEqual(keys, ["a", "b", "c"]);
  });

  // it("can resolve the objects in a graph", async () => {
  //   const graph = new ObjectGraph({
  //     a: {
  //       b: {
  //         c: Promise.resolve("Hello"),
  //         d: "world",
  //       },
  //     },
  //   });
  //   const resolved = await graph.resolve();
  //   assert.deepEqual(resolved, {
  //     a: {
  //       b: {
  //         c: "Hello",
  //         d: "world",
  //       },
  //     },
  //   });
  // });

  // it("can return the text of the resolved objects in a graph", async () => {
  //   const graph = new ObjectGraph({
  //     string: "string",
  //     number: 1,
  //     numberPromise: Promise.resolve(2),
  //     boolean: true,
  //   });
  //   const resolved = await graph.resolveText();
  //   assert.deepEqual(resolved, {
  //     string: "string",
  //     number: "1",
  //     numberPromise: "2",
  //     boolean: "true",
  //   });
  // });

  // it("can traverse a set of keys", async () => {
  //   const graph = new ObjectGraph({
  //     a: {
  //       b: {
  //         c: Promise.resolve("Hello"),
  //       },
  //     },
  //   });
  //   const obj = await graph.traverse(["a", "b", "c"]);
  //   assert.equal(obj, "Hello");
  //   const doesntExist = await graph.traverse(["foo"]);
  //   assert.isUndefined(doesntExist);
  // });
});
