/** @typedef {import("@graphorigami/types").AsyncTree} AsyncTree */

import { Tree } from "@graphorigami/core";

/**
 * Return a default .keys.json file for the current tree.
 *
 * @this {AsyncTree|null}
 */
export default async function defaultKeysJson(treelike) {
  const tree = Tree.from(treelike);
  const keyDescriptors = [];
  for (const key of await tree.keys()) {
    // Skip the key .keys.json if present.
    if (key === ".keys.json") {
      continue;
    }
    const isKeyForSubtree = await Tree.isKeyForSubtree(tree, key);
    const keyDescriptor = isKeyForSubtree ? `${key}/` : key;
    keyDescriptors.push(keyDescriptor);
  }
  const json = JSON.stringify(keyDescriptors);
  return json;
}
