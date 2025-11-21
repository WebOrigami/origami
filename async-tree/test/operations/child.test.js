import assert from "node:assert";
import { describe, test } from "node:test";
import child from "../../src/operations/child.js";

describe("child", () => {
  test("defers to map.child() if available", async () => {
    class CustomMap extends Map {
      child(key) {
        return `child-${key}`;
      }

      parent = null;
      trailingSlashKeys = false;
    }
    const map = new CustomMap();
    const result = await child(map, "test");
    assert.strictEqual(result, "child-test");
  });

  test("returns existing subtree if present", async () => {
    const subtree = new Map();
    const map = new Map([["sub", subtree]]);
    const result = await child(map, "sub");
    assert.strictEqual(result, subtree);
  });

  test("creates new subtree if not present", async () => {
    const map = new Map();
    const result = await child(map, "sub");
    assert.ok(result instanceof Map);
    const stored = await map.get("sub");
    assert.strictEqual(stored, result);
  });
});
