import assert from "node:assert";
import process from "node:process";
import { describe, test } from "node:test";
import coreGlobals from "../../src/project/coreGlobals.js";
import projectRootFromPath from "../../src/project/projectRootFromPath.js";
import packageProtocol from "../../src/protocols/package.js";

describe("package: protocol", () => {
  test("returns a package's main export(s)", async () => {
    // Reproduce the type of evaluation context object the runtime would create
    const parent = await projectRootFromPath(process.cwd());
    const globals = await coreGlobals();
    /** @type {any} */ (parent).globals = globals;
    const state = { globals, parent };

    const result = await packageProtocol("@weborigami", "async-tree", state);

    // Try a method from the package
    const { toString } = result;
    assert.equal(toString(123), "123");
  });
});
