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

  test("toJson() renders a map as JSON", async () => {
    const map = new ObjectMap({ a: "Hello, a." });
    const json = await serialize.toJson(map);
    assert.equal(json, `{\n  "a": "Hello, a."\n}`);
  });

  test("toYaml() renders a map as YAML", async () => {
    // Confirm integer keys don't get sorted
    // @ts-ignore
    const map = new Map([
      ["x", "y"],
      [1, "a"],
      [0, "b"],
    ]);
    const yaml = await serialize.toYaml(map);
    assert.equal(yaml, `x: y\n1: a\n0: b\n`);
  });
});
