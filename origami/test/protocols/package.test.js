import { ObjectTree, Tree } from "@weborigami/async-tree";
import { OrigamiFiles } from "@weborigami/language";
import assert from "node:assert";
import { describe, test } from "node:test";
import YAML from "yaml";
import { builtinsTree } from "../../src/internal.js";
import packageNamespace from "../../src/protocols/package.js";

// Create a tree whose scope includes the monorepo's node_modules.
const nodeModulesUrl = new URL("../../../node_modules", import.meta.url);
const nodeModulesTree = new OrigamiFiles(nodeModulesUrl);
nodeModulesTree.parent = builtinsTree;
const tree = new ObjectTree({
  node_modules: nodeModulesTree,
});

describe("package", () => {
  test("imports a package with an organization name", async () => {
    const packageExports = await packageNamespace.call(
      tree,
      "@weborigami",
      "async-tree"
    );
    const { Tree: packageTree } = packageExports;
    assert.equal(packageTree, Tree);
  });

  test("imports a package without an organization name", async () => {
    const packageExports = await packageNamespace.call(tree, "yaml");
    assert.equal(packageExports.Parser, YAML.Parser);
  });

  test("imports a package and traverses optional keys", async () => {
    const result = await packageNamespace.call(tree, "yaml", "Parser");
    assert.equal(result, YAML.Parser);
  });
});
