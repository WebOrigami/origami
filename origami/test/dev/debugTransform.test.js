import assert from "node:assert";
import { describe, test } from "node:test";
import debugTransform from "../../src/dev/debug2/debugTransform.js";

describe("debugTransform", () => {
  test("defines default index.html", async () => {
    const obj = {
      firstKey: 1,
      secondKey: 2,
    };
    const tree = debugTransform(obj);
    const indexHtml = await tree.get("index.html");
    assert(indexHtml.includes("firstKey"));
    assert(indexHtml.includes("secondKey"));
  });

  test("prefers value defined by base tree even if it starts with '!'", async () => {
    const tree = debugTransform({
      "!yaml": "foo",
    });
    const value = await tree.get("!yaml");
    assert.equal(value, "foo");
  });

  test("evaluates an Origami expression using the current tree", async () => {
    const tree = debugTransform({
      a: 1,
      b: 2,
    });
    const value = await tree.get("!keys");
    assert.deepEqual(String(value), `- a\n- b\n`);
  });
});
