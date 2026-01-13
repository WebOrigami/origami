import assert from "node:assert";
import { describe, test } from "node:test";
import projectRootFromPath from "../../src/project/projectRootFromPath.js";
import packageProtocol from "../../src/protocols/package.js";

describe("package: protocol", () => {
  test("returns a package's main export(s)", async () => {
    // Reproduce the type of evaluation context object the runtime would create
    const projectRoot = await projectRootFromPath();
    const context = { container: projectRoot };

    const result = await packageProtocol("@weborigami", "async-tree", context);
    const { toString } = result;
    assert.equal(toString(123), "123");
  });
});
