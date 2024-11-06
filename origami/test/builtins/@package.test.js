import { ObjectTree, Tree } from "@weborigami/async-tree";
import { OrigamiFiles } from "@weborigami/language";
import assert from "node:assert";
import { describe, test } from "node:test";
import { builtins } from "../../src/builtins/internal.js";
import packageNamespace from "../../src/builtins/package.js";

describe("@package", () => {
  test("imports a package from node_modules", async () => {
    // Create a tree whose scope includes the monorepo's node_modules.
    const nodeModulesUrl = new URL("../../../node_modules", import.meta.url);
    const nodeModulesTree = new OrigamiFiles(nodeModulesUrl);
    nodeModulesTree.parent = builtins;

    const tree = new ObjectTree({
      node_modules: nodeModulesTree,
    });
    const packageExports = await packageNamespace.call(
      tree,
      "@weborigami",
      "async-tree"
    );
    const { Tree: packageTree } = packageExports;
    assert.equal(packageTree, Tree);
  });
});
