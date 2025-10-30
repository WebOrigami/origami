import groupBy from "./groupBy.js";

export default async function group(maplike, groupKeyFn) {
  console.warn("Tree.group() is deprecated. Use Tree.groupBy() instead.");
  return groupBy(maplike, groupKeyFn);
}
