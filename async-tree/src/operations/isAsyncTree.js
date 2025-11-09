import isMap from "./isMap.js";

export default function isAsyncTree(treelike) {
  console.warn("Tree.isAsyncTree() is deprecated, use Tree.isMap() instead.");
  return isMap(treelike);
}
