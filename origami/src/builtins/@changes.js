import { Tree } from "@weborigami/async-tree";

// Given an old tree and a new tree, return a tree of changes indicated
// by the values: "added", "changed", or "deleted".
export default async function changes(oldTreelike, newTreelike) {
  const oldTree = Tree.from(oldTreelike, { deep: true });
  const newTree = Tree.from(newTreelike, { deep: true });

  const oldKeys = Array.from(await oldTree.keys());
  const newKeys = Array.from(await newTree.keys());

  const result = {};

  for (const key of oldKeys) {
    if (!newKeys.includes(key)) {
      result[key] = "deleted";
      continue;
    }

    const oldValue = await oldTree.get(key);
    const newValue = await newTree.get(key);

    if (Tree.isAsyncTree(oldValue) && Tree.isAsyncTree(newValue)) {
      const treeChanges = await changes(oldValue, newValue);
      if (Object.keys(treeChanges).length > 0) {
        result[key] = treeChanges;
      }
    } else if (oldValue?.toString && newValue?.toString) {
      const oldText = oldValue.toString();
      const newText = newValue.toString();
      if (oldText !== newText) {
        result[key] = "changed";
      }
    } else {
      result[key] = "changed";
    }
  }

  for (const key of newKeys) {
    if (!oldKeys.includes(key)) {
      result[key] = "added";
    }
  }

  return result;
}
