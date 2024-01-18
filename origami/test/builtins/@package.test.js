import { Tree } from "@weborigami/async-tree";
import { OrigamiFiles, Scope } from "@weborigami/language";
import assert from "node:assert";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import builtins from "../../src/builtins/@builtins.js";
import packageBuiltin from "../../src/builtins/@package.js";

// Create a scope that includes the monorepo's node_modules.
const dirname = path.dirname(fileURLToPath(import.meta.url));
const nodeModulesPath = path.join(dirname, "..", "..", "..", "node_modules");
const node_modules = Scope.treeWithScope(
  new OrigamiFiles(nodeModulesPath),
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
