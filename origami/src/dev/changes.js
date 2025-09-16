import { getTreeArgument, trailingSlash, Tree } from "@weborigami/async-tree";

/**
 * Given an old tree and a new tree, return a tree of changes indicated
 * by the values: "added", "changed", or "deleted".
 *
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 *
 * @param {Treelike} oldTreelike
 * @param {Treelike} newTreelike
 */
export default async function changes(oldTreelike, newTreelike) {
  const oldTree = await getTreeArgument(oldTreelike, "changes", {
    deep: true,
    position: 0,
  });
  const newTree = await getTreeArgument(newTreelike, "changes", {
    deep: true,
    position: 1,
  });

  const oldKeys = Array.from(await oldTree.keys());
  const newKeys = Array.from(await newTree.keys());

  const oldKeysNormalized = oldKeys.map(trailingSlash.remove);
  const newKeysNormalized = newKeys.map(trailingSlash.remove);

  let result;

  for (const oldKey of oldKeys) {
    const oldNormalized = trailingSlash.remove(oldKey);
    if (!newKeysNormalized.includes(oldNormalized)) {
      result ??= {};
      result[oldKey] = "deleted";
      continue;
    }

    const oldValue = await oldTree.get(oldKey);
    const newValue = await newTree.get(oldKey);

    if (Tree.isAsyncTree(oldValue) && Tree.isAsyncTree(newValue)) {
      const treeChanges = await changes(oldValue, newValue);
      if (treeChanges && Object.keys(treeChanges).length > 0) {
        result ??= {};
        result[oldKey] = treeChanges;
      }
    } else if (oldValue?.toString && newValue?.toString) {
      const oldText = oldValue.toString();
      const newText = newValue.toString();
      if (oldText !== newText) {
        result ??= {};
        result[oldKey] = "changed";
      }
    } else {
      result ??= {};
      result[oldKey] = "changed";
    }
  }

  for (const newKey of newKeys) {
    const newNormalized = trailingSlash.remove(newKey);
    if (!oldKeysNormalized.includes(newNormalized)) {
      result ??= {};
      result[newKey] = "added";
    }
  }

  return result;
}
