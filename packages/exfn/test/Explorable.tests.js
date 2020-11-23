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

  // it("Explorable.call invokes a function directly", () => {
  //   const fixture = (a, b) => a + b;
  //   const value = Explorable.call(fixture, "foo", "bar");
  //   assert.equal(value, "foobar");
  // });

  // it("Explorable.isExplorable can determine whether an object is explorable", () => {
  //   const plainObject = {};
  //   assert(!Explorable.isExplorable(plainObject));

  //   const objectWithSyncIterator = {
  //     [call](arg) {},
  //     [Symbol.iterator]() {},
  //   };
  //   assert(!Explorable.isExplorable(objectWithSyncIterator));

  //   const objectWithAsyncIterator = {
  //     [call](arg) {},
  //     [Symbol.asyncIterator]() {},
  //   };
  //   assert(Explorable.isExplorable(objectWithAsyncIterator));

  //   function functionWithIterator() {}
  //   functionWithIterator[Symbol.iterator] = () => {};
  //   assert(!Explorable.isExplorable(functionWithIterator));

  //   function functionWithAsyncIterator() {}
  //   functionWithAsyncIterator[Symbol.asyncIterator] = () => {};
  //   assert(Explorable.isExplorable(functionWithAsyncIterator));
  // });

  // it("Explorable.keys returns keys for a function with an async iterator", async () => {
  //   function functionWithAsyncIterator() {}
  //   functionWithAsyncIterator[Symbol.asyncIterator] = function* () {
  //     yield* ["a", "b", "c"];
  //   };
  //   assert.deepEqual(await Explorable.keys(functionWithAsyncIterator), [
  //     "a",
  //     "b",
  //     "c",
  //   ]);
  // });

  // it("Explorable.from can crate an explorable plain object", async () => {
  //   const fixture = Explorable.from({
  //     a: 1,
  //     b: 2,
  //     c: 3,
  //   });
  //   const keys = await Explorable.keys(fixture);
  //   assert.deepEqual(keys, ["a", "b", "c"]);
  // });

  // it("Explorable.values can return the flat list of values", async () => {
  //   const fixture = Explorable.from({
  //     a: 1,
  //     b: 2,
  //     c: 3,
  //     more: {
  //       d: 4,
  //       e: 5,
  //     },
  //   });
  //   const values = await Explorable.values(fixture);
  //   assert.deepEqual(values.slice(0, 3), [1, 2, 3]);
  //   const nestedValues = await Explorable.values(values[3]);
  //   assert.deepEqual(nestedValues, [4, 5]);
  // });

  // it("Explorable.collapse can collapse a graph using a callback", async () => {
  //   const fixture = Explorable.from({
  //     a: 1,
  //     b: 2,
  //     c: 3,
  //     more: {
  //       d: 4,
  //       e: 5,
  //     },
  //   });
  //   const collapsed = await Explorable.collapse(fixture, (...values) => [
  //     ...values,
  //   ]);
  //   assert.deepEqual(collapsed, [1, 2, 3, [4, 5]]);
  // });

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
