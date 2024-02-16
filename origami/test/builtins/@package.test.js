import { Tree } from "@weborigami/async-tree";
import { OrigamiFiles, Scope } from "@weborigami/language";
import assert from "node:assert";
import { describe, test } from "node:test";
import builtins from "../../src/builtins/@builtins.js";
import packageBuiltin from "../../src/builtins/@package.js";

// Create a scope that includes the monorepo's node_modules.
const nodeModulesUrl = new URL("../../../node_modules", import.meta.url);
const node_modules = Scope.treeWithScope(
  new OrigamiFiles(nodeModulesUrl),
  builtins
);

describe("@package", () => {
  test("imports a package from node_modules", async () => {
    const scope = new Scope({
      node_modules,
    });
    const packageExports = await packageBuiltin.call(
      scope,
      "@weborigami",
      "async-tree"
    );
    const { Tree: packageTree } = packageExports;
    assert.equal(packageTree, Tree);
  });
});
