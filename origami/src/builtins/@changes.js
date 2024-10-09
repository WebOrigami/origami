import { Tree } from "@weborigami/async-tree";

/**
 * Given an old tree and a new tree, return a tree of changes indicated
 * by the values: "added", "changed", or "deleted".
 *
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 *
 * @this {import("@weborigami/types").AsyncTree|null}
 * @param {Treelike} oldTreelike
 * @param {Treelike} newTreelike
 */
export default async function changes(oldTreelike, newTreelike) {
  const oldTree = Tree.from(oldTreelike, { deep: true, parent: this });
  const newTree = Tree.from(newTreelike, { deep: true, parent: this });

  const oldKeys = Array.from(await oldTree.keys());
  const newKeys = Array.from(await newTree.keys());

  let result;

  for (const key of oldKeys) {
    if (!newKeys.includes(key)) {
      result ??= {};
      result[key] = "deleted";
      continue;
    }

    const oldValue = await oldTree.get(key);
    const newValue = await newTree.get(key);

    if (Tree.isAsyncTree(oldValue) && Tree.isAsyncTree(newValue)) {
      const treeChanges = await changes.call(this, oldValue, newValue);
      if (treeChanges && Object.keys(treeChanges).length > 0) {
        result ??= {};
        result[key] = treeChanges;
      }
    } else if (oldValue?.toString && newValue?.toString) {
      const oldText = oldValue.toString();
      const newText = newValue.toString();
      if (oldText !== newText) {
        result ??= {};
        result[key] = "changed";
      }
    } else {
      result ??= {};
      result[key] = "changed";
    }
  }

  for (const key of newKeys) {
    if (!oldKeys.includes(key)) {
      result ??= {};
      result[key] = "added";
    }
  }

  return result;
}
