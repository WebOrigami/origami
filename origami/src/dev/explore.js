/** @typedef {import("@weborigami/types").AsyncTree} AsyncTree */
import { Tree } from "@weborigami/async-tree";
import { OrigamiFiles } from "@weborigami/language";
import path from "node:path";
import { fileURLToPath } from "node:url";
import assertTreeIsDefined from "../common/assertTreeIsDefined.js";
import { getDescriptor } from "../common/utilities.js";
import { oriHandler } from "../handlers/handlers.js";
import debug from "./debug.js";

let templatePromise;

/**
 * @this {AsyncTree|null}
 */
export default async function explore(...keys) {
  assertTreeIsDefined(this, "explore");
  if (!this) {
    return undefined;
  }

  const tree = Tree.from(this);

  /** @type {any} */
  let result;
  if (keys.length > 0) {
    // Traverse the scope using the given keys.
    const debugTree = await debug.call(tree, this);
    if (!debugTree) {
      return undefined;
    }
    const debugScope = await Tree.scope(debugTree);
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
    const scope = await Tree.scope(tree);
    const data = await getScopeData(scope);
    templatePromise ??= loadTemplate();
    const template = await templatePromise;
    const text = await template.call(this, data);

    result = new String(text);
    result.unpack = () => debug.call(tree, tree);
  }

  return result;
}

async function getScopeData(scope) {
  const trees = scope.trees ?? [scope];
  const data = [];
  for (const tree of trees) {
    const name = getDescriptor(tree);
    const treeKeys = Array.from(await tree.keys());
    // Skip system-ish files that start with a period.
    const keys = treeKeys.filter((key) => !key.startsWith?.("."));
    data.push({ name, keys });
  }
  return data;
}

async function loadTemplate() {
  const folderPath = path.resolve(fileURLToPath(import.meta.url), "..");
  const folder = new OrigamiFiles(folderPath);
  const templateFile = await folder.get("explore.ori");
  const template = await oriHandler.unpack(templateFile, { parent: folder });
  return template;
}
