import { Tree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import packageBuiltin from "../../src/builtins/@package.js";

describe("@package", () => {
  test("imports a package from node_modules", async () => {
    const packageExports = await packageBuiltin.call(
      null,
      "@weborigami/async-tree"
    );
    const { Tree: packageTree } = packageExports;
    assert.equal(packageTree, Tree);
  });
});
