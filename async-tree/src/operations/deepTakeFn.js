import { Tree } from "../internal.js";

/**
 * Returns a function that traverses a tree deeply and returns the values of the
 * first `count` keys.
 *
 * @param {number} count
 */
export default function deepTakeFn(count) {
  /**
   * @param {import("../../index.ts").Treelike} treelike
   */
  return async function deepTakeFn(treelike) {
    const tree = await Tree.from(treelike, { deep: true });
    const { values } = await traverse(tree, count);
    return Tree.from(values);
  };
}

async function traverse(tree, count) {
  const values = [];
  for (const key of await tree.keys()) {
    if (count <= 0) {
      break;
    }
    let value = await tree.get(key);
    if (Tree.isAsyncTree(value)) {
      const traversed = await traverse(value, count);
      values.push(...traversed.values);
      count = traversed.count;
    } else {
      values.push(value);
      count--;
    }
  }
  return { count, values };
}
