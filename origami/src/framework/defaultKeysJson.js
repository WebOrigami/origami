/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */

import { Tree } from "@graphorigami/core";

/**
 * Return a default .keys.json file for the current tree.
 *
 * @this {AsyncDictionary|null}
 */
export default async function defaultKeysJson(treelike) {
  const tree = Tree.from(treelike);
  const keys = Array.from(await tree.keys());
  // Skip the key .keys.json if present.
  const filtered = keys.filter((key) => key !== ".keys.json");
  const json = JSON.stringify(filtered);
  return json;
}
