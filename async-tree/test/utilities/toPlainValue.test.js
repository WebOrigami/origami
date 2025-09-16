import assert from "node:assert";
import { describe, test } from "node:test";
import toPlainValue from "../../src/utilities/toPlainValue.js";

describe("toPlainValue", () => {
  test("returns the plainest representation of an object", async () => {
    class User {
      constructor(name) {
        this.name = name;
      }
    }

    assert.equal(await toPlainValue(1), 1);
    assert.equal(await toPlainValue("string"), "string");
    assert.deepEqual(await toPlainValue({ a: 1 }), { a: 1 });
    assert.equal(
      await toPlainValue(new TextEncoder().encode("bytes")),
      "bytes"
    );
    // ArrayBuffer with non-printable characters should be returned as base64
    assert.equal(await toPlainValue(new Uint8Array([1, 2, 3]).buffer), "AQID");
    assert.equal(await toPlainValue(async () => "result"), "result");
    assert.deepEqual(await toPlainValue(new User("Alice")), {
      name: "Alice",
    });
  });
});
