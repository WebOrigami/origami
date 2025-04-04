import { Tree } from "../internal.js";
import { assertIsTreelike } from "../utilities.js";

/**
 * Returns a function that traverses a tree deeply and returns the values of the
 * first `count` keys.
 *
 * This is similar to `deepValues`, but it is more efficient for large trees as
 * stops after `count` values.
 *
 * @param {import("../../index.ts").Treelike} treelike
 * @param {number} count
 */
export default async function deepTake(treelike, count) {
  assertIsTreelike(treelike, "deepTake");
  const tree = await Tree.from(treelike, { deep: true });

  const { values } = await traverse(tree, count);
  return Tree.from(values, { deep: true });
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
