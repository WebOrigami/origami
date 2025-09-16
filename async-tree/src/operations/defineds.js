import getTreeArgument from "../utilities/getTreeArgument.js";
import mapReduce from "./mapReduce.js";

/**
 * Return only the defined (not `undefined`) values in the deep tree.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike} treelike
 */
export default async function defineds(treelike) {
  console.warn(
    "Warning: Tree.defineds is deprecated. If you have a use for it, please let us know."
  );
  const tree = await getTreeArgument(treelike, "defineds", { deep: true });

  const result = await mapReduce(tree, null, async (values, keys) => {
    const object = {};
    let someValuesExist = false;
    for (let i = 0; i < keys.length; i++) {
      const value = values[i];
      if (value != null) {
        someValuesExist = true;
        object[keys[i]] = values[i];
      }
    }
    return someValuesExist ? object : null;
  });

  return result;
}
