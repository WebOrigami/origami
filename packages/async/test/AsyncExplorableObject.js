import chai from "chai";
import AsyncExplorableObject from "../src/AsyncExplorableObject.js";
const { assert } = chai;

describe("AsyncExplorableObject", () => {
  it("provides a default [get] method", async () => {
    const fixture = new AsyncExplorableObject({
      a: "A",
    });
    assert.equal(await fixture[AsyncExplorableObject.get]("a"), "A");
  });

  it("provides a default [asyncIterator] method", async () => {
    const fixture = new AsyncExplorableObject({
      a: null,
      b: null,
      c: null,
    });
    const keys = await AsyncExplorableObject.keys(fixture);
    assert.deepEqual(keys, ["a", "b", "c"]);
  });

  it("defers to the source object's own [get] method if defined", async () => {
    const fixture = new AsyncExplorableObject({
      a: "A", // This is overridden by the [get] method, shouldn't be returned.

      [AsyncExplorableObject.get](key) {
        if (key === "a") {
          return "B";
        }
      },
    });
    assert.equal(await fixture[AsyncExplorableObject.get]("a"), "B");
  });

  it("defers to the source object's own [asyncIterator] method if defined", async () => {
    const fixture = new AsyncExplorableObject({
      a: null,
      b: null,
      c: null,

      async *[Symbol.asyncIterator]() {
        yield* ["d", "e"];
      },
    });
    assert.deepEqual(await AsyncExplorableObject.keys(fixture), ["d", "e"]);
  });
});
