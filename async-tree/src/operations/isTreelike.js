import isMaplike from "./isMaplike.js";

export default function isTreelike(treelike) {
  console.warn(
    "Tree.isTreelike() is deprecated, use Tree.isMaplike() instead."
  );
  return isMaplike(treelike);
}
