import isReadOnlyMap from "./isReadOnlyMap.js";

export default function isAsyncMutableTree(treelike) {
  console.warn(
    "Tree.isAsyncMutableTree() is deprecated, use Tree.isReadOnlyMap() instead, which returns the inverse."
  );
  return !isReadOnlyMap(treelike);
}
