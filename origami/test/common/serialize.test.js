import { ObjectMap } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import * as serialize from "../../src/common/serialize.js";

describe("serialize", () => {
  test("parseYaml() can parse YAML text", async () => {
    const yaml = `a: Hello, a.
b: Hello, b.
c: Hello, c.`;
    const data = serialize.parseYaml(yaml);
    assert.deepEqual(data, {
      a: "Hello, a.",
      b: "Hello, b.",
      c: "Hello, c.",
    });
  });

  test("toJson() renders a tree as JSON", async () => {
    const tree = new ObjectMap({ a: "Hello, a." });
    const json = await serialize.toJson(tree);
    assert.equal(json, `{\n  "a": "Hello, a."\n}`);
  });

  test("toYaml() renders a tree as YAML", async () => {
    const tree = new ObjectMap({ a: "Hello, a." });
    const yaml = await serialize.toYaml(tree);
    assert.equal(yaml, `a: Hello, a.\n`);
  });
});
