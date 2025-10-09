/** @typedef {import("@weborigami/types").AsyncTree} AsyncTree */
import { getTreeArgument, Tree } from "@weborigami/async-tree";
import { OrigamiFiles } from "@weborigami/language";
import { oriHandler } from "@weborigami/language/src/handlers/handlers.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getDescriptor } from "../common/utilities.js";
import debug from "./debug.js";

let templatePromise;

/**
 * Display a debug/explore page for the current tree.
 */
export default async function explore(treelike) {
  const tree = await getTreeArgument(treelike, "explore");

  // Construct the template page
  const scope = await Tree.scope(tree);
  const data = await getScopeData(scope);
  templatePromise ??= loadTemplate();
  const template = await templatePromise;
  const text = await template(data);

  // If the user navigates inside this page, unpack back to the original tree.
  /** @type {any} */
  const result = new String(text);
  result.unpack = () => debug(tree);

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
