import groupBy from "./groupBy.js";

export default async function group(treelike, groupKeyFn) {
  console.warn("Tree.group() is deprecated. Use Tree.groupBy() instead.");
  return groupBy(treelike, groupKeyFn);
}
