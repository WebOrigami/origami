import { ObjectTree, Tree } from "@weborigami/async-tree";
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

  test("parseYaml() can parse YAML text with expressions", async () => {
    const yaml = `a: 1
b: !ori a`;
    const tree = serialize.parseYaml(yaml);
    // @ts-ignore
    assert.deepEqual(await Tree.plain(tree), {
      a: 1,
      b: 1,
    });
  });

  test("toJson() renders a tree as JSON", async () => {
    const tree = new ObjectTree({ a: "Hello, a." });
    const json = await serialize.toJson(tree);
    assert.equal(json, `{\n  "a": "Hello, a."\n}`);
  });

  test("toJsonValue() invokes an object's pack() method", async () => {
    const obj = {
      async pack() {
        return 1;
      },
    };
    const value = await serialize.toJsonValue(obj);
    assert.deepEqual(value, 1);
  });

  test("toJsonValue() can map a tree to a plain object", async () => {
    const tree = new ObjectTree({ a: "Hello, a." });
    const value = await serialize.toJsonValue(tree);
    assert.deepEqual(value, { a: "Hello, a." });
  });

  test("toYaml() renders a tree as YAML", async () => {
    const tree = new ObjectTree({ a: "Hello, a." });
    const yaml = await serialize.toYaml(tree);
    assert.equal(yaml, `a: Hello, a.\n`);
  });
});
