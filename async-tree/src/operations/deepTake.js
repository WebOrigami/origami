import * as args from "../utilities/args.js";
import from from "./from.js";
import isMap from "./isMap.js";

/**
 * Returns a function that traverses a tree deeply and returns the values of the
 * first `count` keys.
 *
 * This is similar to `deepValues`, but it is more efficient for large trees as
 * stops after `count` values.
 *
 * @param {import("../../index.ts").Maplike} maplike
 * @param {number} count
 */
export default async function deepTake(maplike, count) {
  const tree = await args.map(maplike, "Tree.deepTake", { deep: true });
  count = args.number(count, "Tree.deepTake", { position: 2 });
  const { values } = await traverse(tree, count);
  return from(values, { deep: true });
}

async function traverse(tree, count) {
  const values = [];
  for await (const key of tree.keys()) {
    if (count <= 0) {
      break;
    }
    let value = await tree.get(key);
    if (isMap(value)) {
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
