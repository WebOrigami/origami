/** @typedef {import("@weborigami/types").AsyncTree} AsyncTree */
import { ObjectTree, Tree, scope } from "@weborigami/async-tree";
import { OrigamiFiles } from "@weborigami/language";
import builtins from "../builtins/@builtins.js";
import { keySymbol } from "../common/utilities.js";
import debug from "./@debug.js";

const miscUrl = new URL("../misc", import.meta.url);
const miscFiles = new OrigamiFiles(miscUrl);
miscFiles.parent = builtins;

/**
 * @this {AsyncTree|null}
 */
export default async function explore(...keys) {
  const tree = this;
  const ambientsTree = new ObjectTree({
    "@current": this,
  });
  ambientsTree[keySymbol] = "explore command";
  ambientsTree.parent = this;

  /** @type {any} */
  let result;
  if (keys.length > 0) {
    // Traverse the scope using the given keys.
    const debugScope = await debug.call(this, ambientsTree);
    if (!debugScope) {
      return undefined;
    }

    // HACK: reproduce logic of ExplorableSiteTransform that turns a trailing
    // slash into index.html. Calling `debug` applies that transform and the
    // transform should handle that logic, but unfortunately the `traverse`
    // operation has special casing to treat a trailing slash, and never gives
    // ExplorableSiteTransform a chance.
    if (keys.at(-1) === "") {
      keys[keys.length - 1] = "index.html";
    }
    result = await Tree.traverse(debugScope, ...keys);
  } else {
    // Return the Explore page for the current scope.
    const templateFile = await miscFiles.get("explore.ori");
    const template = await templateFile.unpack();

    const data = await getScopeData(scope(tree));
    const text = await template(data);

    result = new String(text);
    result.unpack = () => debug.call(tree, ambientsTree);
  }

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
explore.documentation = "https://weborigami.org/language/@explore.html";
