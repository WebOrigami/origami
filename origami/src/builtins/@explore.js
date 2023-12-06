/** @typedef {import("@weborigami/types").AsyncTree} AsyncTree */
import { ObjectTree } from "@weborigami/async-tree";
import { OrigamiFiles, Scope } from "@weborigami/language";
import path from "node:path";
import { fileURLToPath } from "node:url";
import builtins from "../builtins/@builtins.js";
import { keySymbol } from "../common/utilities.js";
import debug from "./@debug.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const miscDir = path.resolve(dirname, "../misc");
const miscFiles = Scope.treeWithScope(new OrigamiFiles(miscDir), builtins);

/**
 * @this {AsyncTree|null}
 */
export default async function explore() {
  const scope = Scope.getScope(this);
  const templateFile = await miscFiles.get("explore.orit");
  const template = await templateFile.unpack();

  const data = await getScopeData(scope);
  const text = await template(data);

  const ambientsTree = new ObjectTree({
    "@current": this,
  });
  ambientsTree[keySymbol] = "explore command";
  const extendedScope = new Scope(ambientsTree, scope);

  /** @type {any} */
  const result = new String(text);
  result.unpack = () => debug.call(scope, extendedScope);

  return result;
}

// To test if a given tree represents the builtins, we walk up the chain to see
// if any of its prototypes are the builtins tree.
function isBuiltins(tree) {
  while (tree) {
    if (tree === builtins) {
      return true;
    }
    tree = Object.getPrototypeOf(tree);
  }
  return false;
}

async function getScopeData(scope) {
  const trees = scope.trees ?? [scope];
  const data = [];
  for (const tree of trees) {
    if (isBuiltins(tree)) {
      // Skip builtins.
      continue;
    }
    const name = tree[keySymbol];
    const treeKeys = Array.from(await tree.keys());
    // Skip system-ish files that start with a period.
    const keys = treeKeys.filter((key) => !key.startsWith?.("."));
    data.push({ name, keys });
  }
  return data;
}

explore.usage = "@explore\tExplore the current scope in the browser";
explore.documentation = "https://graphorigami.org/language/@explore.html";
