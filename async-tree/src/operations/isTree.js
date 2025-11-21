import isMap from "./isMap.js";

/**
 * Return true if the object is maplike and supports the optional tree members.
 *
 * @typedef {import("../../index.ts").AsyncTree} AsyncTree
 * @typedef {import("../../index.ts").SyncTree} SyncTree
 *
 * @param {any} object
 * @returns {object is SyncTree|AsyncTree}
 */
export default function isTree(object) {
  return (
    isMap(object) &&
    "child" in object &&
    typeof object.child === "function" &&
    "parent" in object &&
    "trailingSlashKeys" in object
  );
}
