import { ObjectGraph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import FileLoadersTransform from "../../src/common/FileLoadersTransform.js";
describe("FileLoadersTransform", () => {
  test("returns the contents of text keys/files as text", async () => {
    const json = `{ "bar": 2 }`;
    const graph = new (FileLoadersTransform(ObjectGraph))({
      foo: 1, // Should be left alone
      "bar.json": json, // Should return file with `contents` method
    });
    const foo = await graph.get("foo");
    assert(typeof foo === "number");
    assert.equal(foo, 1);
    const bar = await graph.get("bar.json");
    assert.equal(String(bar), json);
    const contents = await bar.contents();
    assert.deepEqual(contents, { bar: 2 });
  });
});
