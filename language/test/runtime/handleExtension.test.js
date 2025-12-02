import { ObjectMap } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import handleExtension from "../../src/runtime/handleExtension.js";

describe("handleExtension", () => {
  test("attaches an unpack method to a value with an extension", async () => {
    const fixture = createFixture();
    const numberValue = await fixture.get("foo");
    assert(typeof numberValue === "number");
    assert.equal(numberValue, 1);
    const jsonFile = await fixture.get("bar.json");
    const withHandler = await handleExtension(jsonFile, "bar.json", fixture);
    assert.equal(String(withHandler), `{ "bar": 2 }`);
    const data = await withHandler.unpack();
    assert.deepEqual(data, { bar: 2 });
  });
});

function createFixture() {
  return new ObjectMap({
    foo: 1, // No extension, should be left alone
    "bar.json": `{ "bar": 2 }`,
  });
}
