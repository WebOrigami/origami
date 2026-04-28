import assert from "node:assert";
import { beforeEach, describe, test } from "node:test";
import https from "../../src/protocols/https.js";
import systemCache from "../../src/runtime/systemCache.js";

describe("https", () => {
  beforeEach(() => {
    systemCache.clear();
  });

  test("caches fetched resources", async () => {
    const result1 = await https("example.com", {});
    assert(systemCache.has("https://example.com"));
    const text = new TextDecoder().decode(result1);
    assert(text.includes("Example Domain"));
    const result2 = await https("example.com");
    assert.strictEqual(result1, result2);
  });
});
