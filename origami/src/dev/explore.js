/** @typedef {import("@weborigami/types").AsyncTree} AsyncTree */
import { Tree, scope } from "@weborigami/async-tree";
import { OrigamiFiles } from "@weborigami/language";
import { builtinsTree } from "../builtins/internal.js";
import { keySymbol } from "../common/utilities.js";
import assertTreeIsDefined from "../misc/assertTreeIsDefined.js";
import debug from "./debug.js";

const miscUrl = new URL("../misc", import.meta.url);

/**
 * @this {AsyncTree|null}
 */
export default async function explore(...keys) {
  assertTreeIsDefined(this, "origami:explore");
  if (!this) {
    return undefined;
  }

  /** @type {any} */
  let result;
  if (keys.length > 0) {
    // Traverse the scope using the given keys.
    const debugTree = await debug.call(this, this);
    if (!debugTree) {
      return undefined;
    }
    const debugScope = scope(debugTree);
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
    const miscFiles = new OrigamiFiles(miscUrl);
    miscFiles.parent = builtinsTree;
    const templateFile = await miscFiles.get("explore.ori");
    const template = await templateFile.unpack();

    const data = await getScopeData(scope(this));
    const text = await template(data);

    result = new String(text);
    const tree = this;
    result.unpack = () => debug.call(tree, tree);
  }

  return result;
}
explore.description =
  "explore() - Explore the current scope [when run in browser]";

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
