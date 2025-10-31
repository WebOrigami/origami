import assert from "node:assert";
import { describe, test } from "node:test";
import toPlainValue from "../../src/utilities/toPlainValue.js";

describe("toPlainValue", () => {
  test("returns primitive value as is", async () => {
    assert.equal(await toPlainValue(1), 1);
    assert.equal(await toPlainValue("hello"), "hello");
  });

  test("invokes functions and resolves promises", async () => {
    assert.equal(
      await toPlainValue(() => "function result"),
      "function result"
    );
    assert.equal(
      await toPlainValue(Promise.resolve("promise result")),
      "promise result"
    );
  });

  test("plain object returned as is", async () => {
    const obj = { a: 1, b: 2 };
    assert.deepEqual(await toPlainValue(obj), obj);
  });

  test("resolves asynchronous object property", async () => {
    const obj = {
      get a() {
        return Promise.resolve(1);
      },
      b: 2,
    };
    assert.deepEqual(await toPlainValue(obj), { a: 1, b: 2 });
  });

  test("converts maplike to plain object", async () => {
    const map = new Map([
      ["a", 1],
      ["b", 2],
    ]);
    assert.deepEqual(await toPlainValue(map), { a: 1, b: 2 });
  });

  test("ArrayBuffer with printable characters is returned as text", async () => {
    const encoder = new TextEncoder();
    const buffer = encoder.encode("printable text").buffer;
    assert.equal(await toPlainValue(buffer), "printable text");
  });

  test("ArrayBuffer with non-printable characters is returned as base64", async () => {
    const buffer = new Uint8Array([1, 2, 3]).buffer;
    assert.equal(await toPlainValue(buffer), "AQID");
  });

  test("converts class instance to plain object", async () => {
    class User {
      constructor(name) {
        this.name = name;
      }
    }
    assert.deepEqual(await toPlainValue(new User("Alice")), {
      name: "Alice",
    });
  });
});
