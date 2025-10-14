import assert from "node:assert";
import { describe, test } from "node:test";
import packageProtocol from "../../src/protocols/package.js";

describe("package: protocol", () => {
  test("returns a package's main export(s)", async () => {
    const result = await packageProtocol("@weborigami", "async-tree");
    const { toString } = result;
    assert.equal(toString(123), "123");
  });
});
